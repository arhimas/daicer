import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { PNG } from "pngjs";
import { PromptKey, PromptVariableMap } from './prompt-registry';

// Types embedded for now to avoid complexity
export type ZoneType = 'core' | 'head' | 'hand_l' | 'hand_r' | 'weapon' | 'back' | 'legs' | 'accessory' | 'none';
export type AssetType = 'Monster' | 'Item' | 'Race' | 'Environment' | 'Terrain' | 'Sprite' | 'Blueprint';
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
  entityContext?: { uid: string; documentId: string };
}

const TERMS = {
    TERRAIN: ['Solid Block', 'Landscape/Floor', 'Terrain', 'Environment'],
    ITEM: ['Sword', 'Polearm', 'Shield', 'Headwear', 'Body Armor', 'Legwear', 'Handwear', 'Footwear', 'Accessory', 'Item']
};

/**
 * **Gemini Pixel Forge Service**
 * Powered by LangChain, Zod & Gemini 3
 * now with Dynamic Strapi Prompts (STRICT MODE)!
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

  /**
   * STRICT: Fetches prompt from DB. Throws if missing. No fallbacks.
   */
  async getPromptTemplate<K extends PromptKey>(key: K): Promise<PromptTemplate> {
      try {
          const entry = await strapi.db.query('api::prompt.prompt').findOne({ 
              where: { key }
          });
          
          if (!entry || !entry.text) {
              strapi.log.error(`CRITICAL: Prompt '${key}' missing in DB.`);
              throw new Error(`State of Art Enforcement: Prompt '${key}' MUST exist in Strapi DB. No fallbacks allowed.`);
          }
          
          return PromptTemplate.fromTemplate(entry.text);
      } catch (e) {
         strapi.log.error(`Failed to fetch prompt '${key}'`, e);
         throw e;
      }
  },

  async formatPrompt<K extends PromptKey>(key: K, variables: PromptVariableMap[K]): Promise<string> {
      const template = await this.getPromptTemplate(key);
      return await template.format(variables);
  },

  async generatePixelData(config: GenerationConfig) {
    // Dispatcher PatternOverride
    if (config.type === 'Blueprint' || config.action === 'generate_blueprint') {
        return this.generateBlueprint(config);
    }
    
    if (config.action === 'generate_voxel') {
        return this.generateVoxelStructure(config);
    }

    const WIDTH = config.width || 32;
    const HEIGHT = config.height || 32;
    const modelId = config.model || 'gemini-3-flash-preview'; 

    const isTerrain = TERMS.TERRAIN.includes(config.archetype) || config.type === 'Terrain' || config.type === 'Environment';
    const isItem = TERMS.ITEM.includes(config.archetype) || config.type === 'Item';

    strapi.log.info(`[GeminiService] Config Keys: ${Object.keys(config).join(', ')} | EntityContext: ${JSON.stringify(config.entityContext)}`);
    
    // 1. Enhancement Phase REMOVED (User Request)
    // We now pass the raw prompt directly to the system.
    const enhancedPrompt = config.prompt;

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



    // 3. SOTA Context Injection (Deep Fetch + Schema Introspection)
    let contextDataString = "";
    
    if (config.entityContext?.uid && config.entityContext?.documentId) {
        try {
            const { uid, documentId } = config.entityContext;
            
            // A. Deep Fetch Entity (Database State)
            const dbEntity = await strapi.plugin('map-explorer').service('contextService').fetchDeepContext(uid, documentId);

            // B. Merge Frontend Data (Draft State)
            // CRITICAL: The user might be editing the entity. Form data (entityData) must override Database data.
            // This prevents "I am editing a Potion to be a Sword" resulting in a Potion generation because the DB wasn't saved yet.
            const mergedEntity = { 
                ...dbEntity, 
                ...(config.entityContext.uid === uid ? config.entityData : {}) 
            };

            // C. Introspect Schema
            const model = strapi.getModel(uid);
            
            // D. Build Context String
            contextDataString = `ENTITY TYPE: ${model.info.displayName || uid}\n` + 
                                `JSON DATA:\n${JSON.stringify(mergedEntity, null, 2)}`;
            
            strapi.log.info(`Pixel Forge: SOTA Deep Context Injected (Merged Draft) for ${uid}:${documentId}`);
            
            // [HARDENING] Conflict Resolution strategies:
            if (config.prompt && config.prompt.length > 5) {
                contextDataString += `\n\n[IMPORTANT OVERRIDE]: The user has provided a specific generation prompt: "${config.prompt}".\n` +
                                     `If this prompt conflicts with the JSON DATA above, you MUST prioritize the PROMPT for visual appearance.`;
            }

        } catch (e) {
            strapi.log.warn("Pixel Forge: Deep Context Fetch Failed/Skipped, using Shallow Data.", e);
            contextDataString = formatShallowContext(config.entityData);
        }
    } else {
        contextDataString = formatShallowContext(config.entityData);
    }

    // Helper to make Shallow Data look SOTA
    function formatShallowContext(data: Record<string, unknown> | undefined) {
        const context = [
            "ENTITY CONTEXT (Draft/Shallow):",
            `- Generated Type: ${config.type}`,
            `- Archetype: ${config.archetype}`,
            `- Target Size: ${config.size} (${config.width}x${config.height})`
        ];
        
        if (data && Object.keys(data).length > 0) {
            for (const [key, value] of Object.entries(data)) {
                if (['password', 'confirmation', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'publishedAt', 'localizations', 'locale'].includes(key)) continue;
                const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                context.push(`- ${key}: ${valStr}`);
            }
        } else {
            context.push("- (No additional form data provided)");
        }
        return context.join('\n');
    }

    // 4. Vision Pipeline
    let visionInstruction = "Analyze the visual blueprint provided. The colored zones indicate semantic meaning (see system instructions).";
    let dynamicZoneMap: Record<string, string> | undefined;

    // Dynamic Zone Context Injection
    try {
        const zones = await strapi.db.query('api::entity-zone.entity-zone').findMany();
        if (zones && zones.length > 0) {
             dynamicZoneMap = {}; // Initialize
             const zoneList = zones.map((z: { name: string; slug: string; color: string; description?: string }) => {
                 const color = z.color.toUpperCase();
                 const slug = z.slug.toLowerCase();
                 // Map Slug -> Color for blueprintToPixels
                 if (dynamicZoneMap) dynamicZoneMap[slug] = color;
                 
                 return `- ${z.name} [${color}]: ${z.description || ''}`;
             }).join('\n');
             visionInstruction += `\n\nSEMANTIC ZONES (Color -> Meaning):\n${zoneList}`;
        }
    } catch(e) {
        strapi.log.warn("Failed to load zones for prompt context", e);
    }
    
    // Render Vision Input (Blueprint or Input Pixels)
    let visionBuffer: Buffer;
    
    if (config.inputPixels && config.inputPixels.length > 0) {
        // Iterative Refinement: Upscale current state 2x for "Zoomed In" focus
        visionBuffer = this.pixelsToPng(config.inputPixels, 2); 
    } else if (config.blueprint) {
        // Blueprint Generation: Render blueprint structure 2x
        const blueprintPixels = this.blueprintToPixels(config.blueprint, dynamicZoneMap);
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

    // 5. Fetch Main System Template (Strict Typed)
    const formattedSystemPrompt = await this.formatPrompt('pixel-forge-system', {
        width: WIDTH,
        height: HEIGHT,
        specificInstruction,
        enhancedPrompt: enhancedPrompt,
        visionInstruction,
        contextData: contextDataString // Injection of SOTA Context
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
        if (config.entityContext) {
            strapi.log.info(`PixelForge Context Check: UID=${config.entityContext.uid}, DocID=${config.entityContext.documentId}`);
        } else {
            strapi.log.warn(`PixelForge Context MISSING: entityContext is undefined or null.`);
        }

        const cleanData = this.postProcessPixelData(validatedData);

        // Terminology Fix: Return 'effectivePrompt' instead of 'enhancedPrompt' to avoid user confusion
        return { pixelData: cleanData, effectivePrompt: enhancedPrompt };

    } catch (error) {
       strapi.log.error("Gemini Forge LangChain Error", error);
       throw error;
    }
  },

  async generateBlueprint(config: GenerationConfig) {
      const width = config.width || 32;
      const height = config.height || 32;
      const modelId = config.model || 'gemini-3-pro-preview';
      
      // Sanitization: Strip "Humanoid_" and "[Creature]" prefixes to prevent hallucinating a wielder when we only want the item.
      // Blueprints are atomic (e.g. just the Sword, not the Guy holding it).
      const cleanPrompt = config.prompt
        .replace(/Humanoid_/gi, '')
        .replace(/\[Creature\] - /gi, '')
        .replace(/_/g, ' ') // Replace underscores with spaces for better NLP
        .trim();

      const contextData = config.entityData ? `CONTEXT: ${JSON.stringify(config.entityData)}` : "";

      try {
          const model = await this.getModel(modelId);
          // Dynamic Zone Loading with Strict Symbols
          const zones = await strapi.db.query('api::entity-zone.entity-zone').findMany();
          
          let zoneInstruction = "STRICT LEGEND (Symbol -> Meaning):\n- . : Empty Space\n";
          const allowedChars = ['.'];
          
          const charToZone: Record<string, string> = { '.': 'none' };
          const zoneToColor: Record<string, string> = { 'none': 'transparent' };
          
          // Legacy/Fallback mapping
          const fallbackMap: Record<string, string> = { 'core': '#', 'head': 'O', 'weapon': 'X', 'hand_l': 'l', 'hand_r': 'r', 'legs': 'L', 'accessory': '+' };
          
          zones.forEach((z: { name: string; slug: string; color: string; description?: string; symbol: string }) => {
             // Prefer DB Symbol, fallback to legacy, then First Char
             const symbol = z.symbol || fallbackMap[z.slug] || z.slug[0].toUpperCase();
             
             if (!allowedChars.includes(symbol)) {
                 allowedChars.push(symbol);
                 zoneInstruction += `- ${symbol} : ${z.name}\n`;
                 charToZone[symbol] = z.slug;
                 zoneToColor[z.slug] = z.color;
             }
          });

          // ... inside generateBlueprint ...
          
          /*
             STRICT TYPING ENFORCEMENT:
             We use this.formatPrompt which requires the variables to match PromptVariableMap['blueprint-architect']
          */
          const formattedPrompt = await this.formatPrompt('blueprint-architect', {
              prompt: cleanPrompt,
              archetype: config.archetype || 'entity',
              width,
              height,
              contextData: `${contextData}\n\n${zoneInstruction}\nCRITICAL: You must ONLY use the symbols listed in the Legend above.`
          });

          const BlueprintSchema = z.object({
              blueprint: z.array(z.string()).describe(`Array of ${height} strings. Each string must be exactly ${width} characters long. ALLOWED CHARACTERS: [${allowedChars.join(', ')}]`)
          });

          const modelWithStructure = model.withStructuredOutput(BlueprintSchema);
          const response = await modelWithStructure.invoke(formattedPrompt);
          
          const rows = response.blueprint;
          const grid = rows.map(r => r.split(''));
          const validatedGrid = this.validateAndRepairGrid(grid, width, height);
          
          const visualGrid = validatedGrid.map(row => 
              row.map(char => {
                  const slug = charToZone[char];
                  // If implicit DB symbol matches, try to find color directly
                  if (!slug && zones.find((z: { symbol: string }) => z.symbol === char)) {
                      const z = zones.find((z: { symbol: string; color: string }) => z.symbol === char);
                      return z?.color || 'transparent';
                  }
                  return slug ? (zoneToColor[slug] || 'transparent') : 'transparent';
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
          const formattedPrompt = await this.formatPrompt('voxel-architect', {
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
  blueprintToPixels(blueprint: ZoneType[][], customMap?: Record<string, string>): string[][] {
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
          '#': '#FFFFFF',
          ...(customMap || {})
      };

      return blueprint.map(row => 
          row.map(cell => {
             const key = cell.toLowerCase();
             return ZONE_COLORS[key] || ZONE_COLORS[cell] || 'transparent';
          })
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
