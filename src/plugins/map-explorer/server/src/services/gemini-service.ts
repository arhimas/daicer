import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { PNG } from "pngjs";

// Types embedded for now to avoid complexity
export type ZoneType = 'core' | 'head' | 'hand_l' | 'hand_r' | 'weapon' | 'back' | 'legs' | 'accessory' | 'none';
export type AssetType = 'Monster' | 'Item' | 'Race' | 'Environment' | 'Terrain' | 'Sprite';
export type Archetype = string; // Flexible

export interface GenerationConfig {
  prompt: string;
  type: AssetType;
  archetype: Archetype;
  blueprint: ZoneType[][];
  model?: string;
  inputPixels?: string[][];
  size?: string;
  width?: number;
  height?: number;

  action?: string; 
  entityData?: Record<string, unknown>; 
}

const TERMS = {
    TERRAIN: ['Solid Block', 'Landscape/Floor', 'Terrain', 'Environment'],
    ITEM: ['Sword', 'Polearm', 'Shield', 'Headwear', 'Body Armor', 'Legwear', 'Handwear', 'Footwear', 'Accessory', 'Item']
};

/**
 * **Gemini Pixel Forge Service**
 * Powered by LangChain, Zod & Gemini 3
 * now with Dynamic Strapi Prompts!
 */
export default ({ strapi }) => ({
  
  async getModel(modelId: string) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
      
      return new ChatGoogleGenerativeAI({
          model: modelId,
          apiKey,
          temperature: 0.5,
          maxRetries: 2
      });
  },

  async getPromptTemplate(key: string): Promise<PromptTemplate> {
      try {
          const entry = await strapi.db.query('api::prompt.prompt').findOne({ 
              where: { key }
          });
          
          if (!entry || !entry.text) {
              strapi.log.warn(`Prompt key '${key}' not found in Strapi. Falling back to hardcoded default.`);
              // Fallback logic could go here, or throw error.
              // For robustness, throw error to force DB seed.
              throw new Error(`Prompt '${key}' not found in Strapi.`);
          }
          
          return PromptTemplate.fromTemplate(entry.text);
      } catch (e) {
         strapi.log.error(`Failed to fetch prompt '${key}'`, e);
         throw e;
      }
  },

  async generatePixelData(config: GenerationConfig) {
    const WIDTH = config.width || 32;
    const HEIGHT = config.height || 32;
    const modelId = config.model || 'gemini-3-flash-preview'; 

    const isTerrain = TERMS.TERRAIN.includes(config.archetype) || config.type === 'Terrain' || config.type === 'Environment';
    const isItem = TERMS.ITEM.includes(config.archetype) || config.type === 'Item';
    
    // 1. Fetch Enhancement Template
    let enhanceKey = 'enhance-character';
    if (isTerrain) enhanceKey = 'enhance-terrain';
    else if (isItem) enhanceKey = 'enhance-item';

    const enhanceTemplate = await this.getPromptTemplate(enhanceKey);
    const enhancedPrompt = await enhanceTemplate.format({ rawPrompt: config.prompt });

    // 2. Size & Framing Logic (Hardcoded for now as it's algorithmic, not purely text)
    const size = config.size || 'Medium';
    let framingInstruction = `FITTING: Fill the ${WIDTH}x${HEIGHT} grid comfortably.`;
    
    if (WIDTH > 32 || HEIGHT > 32) {
       framingInstruction = `
       FITTING: LARGE ENTITY (${WIDTH}x${HEIGHT}). 
       - UTILIZE the extra space for detail.
       - IMPORTANT: The subject MUST be centered in the ${WIDTH}x${HEIGHT} canvas.
       - If the subject is 'Gargantuan', fill the canvas to the edges.
       `;
    } else if (['Tiny', 'Small'].includes(size)) {
        framingInstruction = "FITTING: CENTER the object within the middle 16x16 pixels. LEAVE TRANSPARENT PADDING.";
    }

    let specificInstruction = "";
    if (isTerrain) {
        specificInstruction = `
        MODE: TERRAIN / TEXTURE GENERATION
        - Scale: 32x32 pixels = 1 sq. ft.
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - '#' = Surface to fill.
        1. Fill the area marked with '#' completely.
        2. Create a top-down or consistent surface tile.
        `;
    } else if (isItem) {
        specificInstruction = `
        MODE: ITEM / OBJECT GENERATION
        - Scale: 32x32 pixels = 1 sq. ft.
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - ${framingInstruction}
        - '#' = Handle/Shaft, 'X' = Blade/Head...
        CRITICAL: FILL blueprinted pixels. Keep transparency outside the object.
        `;
    } else {
        specificInstruction = `
        MODE: CREATURE GENERATION
        - Scale: 32x32 pixels = 5 sq. ft (Standard).
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - ${framingInstruction}
        - CENTERING: Feet at Y=${Math.floor(HEIGHT * 0.8)}.
        CRITICAL: FILL the anatomy with colors matching the description.
        `;
    }

    // 3. Vision Pipeline (Mandatory 2x Scaling)
    const visionInstruction = "Analyze the visual blueprint provided. The colored zones indicate semantic meaning (see system instructions).";
    
    if (config.entityData) {
        strapi.log.info(`Pixel Forge: Injecting Context Data (Keys: ${Object.keys(config.entityData).join(', ')})`);
    }
    const contextData = config.entityData ? `CONTEXTUAL DATA: ${JSON.stringify(config.entityData)}` : "";

    // Render Vision Input (Blueprint or Input Pixels)
    let visionBuffer: Buffer;
    
    if (config.inputPixels && config.inputPixels.length > 0) {
        // Iterative Refinement: Upscale current state 2x for "Zoomed In" focus
        visionBuffer = this.pixelsToPng(config.inputPixels, 2); 
    } else if (config.blueprint) {
        // Blueprint Generation: Render blueprint structure 2x
        const blueprintPixels = this.blueprintToPixels(config.blueprint);
        visionBuffer = this.pixelsToPng(blueprintPixels, 2);
    } else {
        // Pure Vision fallback (Transparent Canvas)
        visionBuffer = this.pixelsToPng(Array(HEIGHT).fill(Array(WIDTH).fill('transparent')));
    }

    const contentParts: { type: string; text?: string; image_url?: string }[] = [
        { type: "text", text: "Manifest this sprite based on the visual input structure." },
        { 
            type: "image_url", 
            image_url: `data:image/png;base64,${visionBuffer.toString('base64')}` 
        }
    ];

    // 3. Fetch Main System Template
    const systemTemplate = await this.getPromptTemplate('pixel-forge-system');
    const formattedSystemPrompt = await systemTemplate.format({
        width: WIDTH,
        height: HEIGHT,
        specificInstruction,
        enhancedPrompt,
        // asciiBlueprint removed - Legacy Field
        visionInstruction,
        contextData
    });

    try {
        const model = await this.getModel(modelId);
        
        const PixelGridSchema = z.object({
            pixelData: z.array(z.array(z.string())).describe(`A ${HEIGHT}x${WIDTH} grid of hex color strings or 'transparent'`)
        });

        const modelWithStructure = model.withStructuredOutput(PixelGridSchema);

        const response = await modelWithStructure.invoke([
            new SystemMessage(formattedSystemPrompt),
            new HumanMessage({ content: contentParts })
        ]);
        
        const rawGrid = response.pixelData;
        const validatedData = this.validateAndRepairGrid(rawGrid, WIDTH, HEIGHT);
        const cleanData = this.postProcessPixelData(validatedData);

        return { pixelData: cleanData, enhancedPrompt };

    } catch (error) {
       strapi.log.error("Gemini Forge LangChain Error", error);
       throw error;
    }
  },

  async generateBlueprint(config: GenerationConfig) {
      const width = config.width || 32;
      const height = config.height || 32;
      const modelId = config.model || 'gemini-3-pro-preview';
      const contextData = config.entityData ? `CONTEXT: ${JSON.stringify(config.entityData)}` : "";

      try {
          const model = await this.getModel(modelId);
          const template = await this.getPromptTemplate('blueprint-architect');
          
          const formattedPrompt = await template.format({
              prompt: config.prompt,
              archetype: config.archetype,
              width,
              height,
              contextData
          });

          const BlueprintSchema = z.object({
              blueprint: z.array(z.string()).describe(`Array of ${height} strings, each length ${width}`)
          });

          const modelWithStructure = model.withStructuredOutput(BlueprintSchema);
          const response = await modelWithStructure.invoke(formattedPrompt);
          
          const rows = response.blueprint;
          const grid = rows.map(r => r.split(''));
          const validatedGrid = this.validateAndRepairGrid(grid, width, height);
          
          const charToZone: Record<string, string> = {
              '#': 'core', 'O': 'head', 'X': 'weapon', 
              'l': 'hand_l', 'r': 'hand_r', 'L': 'legs', 
              '+': 'accessory', '.': 'none'
          };
          
          const zoneToColor: Record<string, string> = {
              'core': '#8B4513', 'head': '#FFD700', 'hand_l': '#FFA07A', 'hand_r': '#FFA07A',
              'weapon': '#C0C0C0', 'legs': '#2F4F4F', 'accessory': '#EE82EE', 'none': 'transparent'
          };
          
          const visualGrid = validatedGrid.map(row => 
              row.map(char => {
                  const zone = charToZone[char] || 'none';
                  return zoneToColor[zone] || 'transparent';
              })
          );

          return { pixelData: visualGrid, blueprint: validatedGrid };

      } catch (e) {
          strapi.log.error("Blueprint Gen Error", e);
          throw e;
      }
  },

  async generateVoxelStructure(config: GenerationConfig) {
      const width = config.width || 16;
      const height = config.width || 16;
      const depth = 7;
      const modelId = config.model || 'gemini-3-flash-preview';
      const contextData = config.entityData ? `CONTEXT: ${JSON.stringify(config.entityData)}` : "";

      try {
          const model = await this.getModel(modelId);
          const template = await this.getPromptTemplate('voxel-architect');

          const formattedPrompt = await template.format({
              prompt: config.prompt,
              width, 
              depth,
              contextData
          });

          const VoxelSchema = z.object({
              voxelData: z.array(z.object({
                  x: z.number().int().min(0).max(width-1),
                  y: z.number().int().min(0).max(height-1),
                  z: z.number().int().min(0).max(depth-1),
                  block: z.string()
              }))
          });

          const modelWithStructure = model.withStructuredOutput(VoxelSchema);
          const response = await modelWithStructure.invoke(formattedPrompt);

          return { voxelData: response.voxelData };

      } catch (e) {
          strapi.log.error("Voxel Gen Error", e);
          throw e;
      }
  },

  // Helpers
  // gridToAscii removed (Vision Pipeline Enforcement)

  validateAndRepairGrid(data: unknown, width = 32, height = 32): string[][] {
      if (!Array.isArray(data)) return Array(height).fill(Array(width).fill('transparent'));

      let grid = data as unknown[];
      if (grid.length > height) grid = grid.slice(0, height);
      while (grid.length < height) grid.push(Array(width).fill('transparent'));

      grid = grid.map((row) => {
          if (!Array.isArray(row)) return Array(width).fill('transparent');
          let newRow = [...row];
          if (newRow.length > width) newRow = newRow.slice(0, width);
          while (newRow.length < width) newRow.push('transparent');
          return newRow.map((cell) => (typeof cell === 'string' ? cell : 'transparent'));
      });
      return grid as string[][];
  },

  postProcessPixelData(generated: string[][]): string[][] {
    return generated.map(row => 
        row.map(color => color || 'transparent')
    );
  },

  // Helpers
  blueprintToPixels(blueprint: ZoneType[][]): string[][] {
      if (!blueprint) return [];
      
      const ZONE_COLORS: Record<string, string> = {
          'core': '#FFFFFF', // White for primary form
          'head': '#FFFF00', // Yellow
          'weapon': '#FF0000', // Red
          'legs': '#0000FF', // Blue
          'hand_l': '#00FF00', 
          'hand_r': '#00FF00',
          'accessory': '#FF00FF',
          'none': 'transparent',
          '.': 'transparent',
          '#': '#FFFFFF' 
      };

      return blueprint.map(row => 
          row.map(cell => ZONE_COLORS[cell] || ZONE_COLORS[cell.toLowerCase()] || 'transparent')
      );
  },

  pixelsToPng(grid: string[][], scale = 1): Buffer {
      const originalWidth = grid[0]?.length || 32;
      const originalHeight = grid.length || 32;
      
      const width = originalWidth * scale;
      const height = originalHeight * scale;
      
      const png = new PNG({ width, height });

      for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
              // Map scaled coordinate back to original
              const sourceX = Math.floor(x / scale);
              const sourceY = Math.floor(y / scale);
              
              const color = grid[sourceY]?.[sourceX] || 'transparent';
              const idx = (width * y + x) << 2;
              let r = 0, g = 0, b = 0, a = 0;
              
              if (color !== 'transparent' && color !== 'none') {
                  const rgb = this.hexToRgb(color);
                  if (rgb) { r = rgb.r; g = rgb.g; b = rgb.b; a = 255; }
              }
              png.data[idx] = r; png.data[idx + 1] = g; png.data[idx + 2] = b; png.data[idx + 3] = a;
          }
      }
      return PNG.sync.write(png);
  },

  hexToRgb(hex: string): { r: number, g: number, b: number } | null {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
  },
  
  // enhancePrompt removed as it is deprecated and unused.
});
