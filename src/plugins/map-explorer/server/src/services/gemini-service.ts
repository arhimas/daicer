import { GoogleGenAI, Type } from "@google/genai";
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
  size?: string; // e.g. 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'
  width?: number;
  height?: number;

  action?: string; // 'generate_pixel' | 'generate_blueprint'
  entityData?: Record<string, unknown>; // Full Context
}



const TERMS = {
    TERRAIN: ['Solid Block', 'Landscape/Floor', 'Terrain', 'Environment'],
    ITEM: ['Sword', 'Polearm', 'Shield', 'Headwear', 'Body Armor', 'Legwear', 'Handwear', 'Footwear', 'Accessory', 'Item']
};

/**
 * **Gemini Pixel Forge Service**
 */
export default ({ strapi }) => ({
  /**
   * Generates pixel data for a requested entity/terrain.
   */
  async generatePixelData(config: GenerationConfig) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    
    // Default to 32x32 if not specified
    const WIDTH = config.width || 32;
    const HEIGHT = config.height || 32;

    const ai = new GoogleGenAI({ apiKey });
    const modelId = config.model || 'gemini-1.5-flash-latest'; // High-speed model for sprites

    const isTerrain = TERMS.TERRAIN.includes(config.archetype) || config.type === 'Terrain' || config.type === 'Environment';
    const isItem = TERMS.ITEM.includes(config.archetype) || config.type === 'Item';
    
    const enhancedPrompt = this.enhancePrompt(config.prompt, config.type, config.archetype);

    // Size & Framing Logic
    const size = config.size || 'Medium';
    
    // Core Sizing Instruction
    let framingInstruction = `FITTING: Fill the ${WIDTH}x${HEIGHT} grid comfortably.`;
    
    if (WIDTH > 32 || HEIGHT > 32) {
       framingInstruction = `
       FITTING: LARGE ENTITY (${WIDTH}x${HEIGHT}). 
       - UTILIZE the extra space for detail.
       - IMPORTANT: The subject MUST be centered in the ${WIDTH}x${HEIGHT} canvas.
       - If the subject is 'Gargantuan', fill the canvas to the edges.
       - If the subject is 'Large' (64x64), leave a small 1-2 pixel transparent border if possible, but prioritize detail.
       `;
    } else if (['Tiny', 'Small'].includes(size)) {
        framingInstruction = "FITTING: CENTER the object within the middle 16x16 to 24x24 pixels. LEAVE TRANSPARENT PADDING around the edges. Do NOT touch the 32x32 border.";
    }

    let specificInstruction = "";
    if (isTerrain) {
        specificInstruction = `
        MODE: TERRAIN / TEXTURE GENERATION
        - Scale: 32x32 pixels = 1 sq. ft.
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - The ASCII Grid below represents the surface area.
        - '#' = Surface to fill.
        
        CRITICAL: 
        1. Fill the area marked with '#' completely with a texture matching the description.
        2. Create a top-down or consistent surface tile.
        3. NO TRANSPARENCY inside the '#' zones.
        `;
    } else if (isItem) {
        specificInstruction = `
        MODE: ITEM / OBJECT GENERATION
        - Scale: 32x32 pixels = 1 sq. ft.
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - ${framingInstruction}
        - The ASCII Grid below represents the object's shape.
        - '#' = Handle/Shaft, 'X' = Blade/Head...
        
        CRITICAL: FILL blueprinted pixels. Keep transparency outside the object.
        `;
    } else {
        specificInstruction = `
        MODE: CREATURE GENERATION
        - Scale: 32x32 pixels = 5 sq. ft (Standard).
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - ${framingInstruction}
        - The ASCII Grid below represents the creature's anatomy.
        - CENTERING: The entity's "feet" or base should be roughly at Y=${Math.floor(HEIGHT * 0.8)} to Y=${HEIGHT-2}.
        
        CRITICAL: FILL the anatomy with colors matching the description.
        `;
    }

    const asciiBlueprint = (config.blueprint && Array.isArray(config.blueprint)) 
        ? this.gridToAscii(config.blueprint) 
        : "NO BLUEPRINT PROVIDED - GENERATE FREELY BASED ON PROMPT";
    
    const systemInstruction = `
      You are a Pixel Art Engine. 
      Your goal is to fill a ${WIDTH}x${HEIGHT} grid with hex colors based on an ASCII structural map.
      ${config.inputPixels ? "You are refining an existing sprite. Use the provided image as a strong reference for shape and color, but enhance it based on the prompt." : ""}
      
      RULES:
      1. OUTPUT: JSON array of ${HEIGHT} arrays (rows). Each row contains ${WIDTH} hex strings.
      2. BACKGROUND: Use "transparent" for '.' (dots) in the ASCII map.
      3. FOREGROUND: You MUST provide a hex color (e.g., "#FF0000") for every non-dot character in the map.
      4. STYLE: High contrast, vivid fantasy RPG style. ${WIDTH}x${HEIGHT} resolution.
      
      ${specificInstruction}
    `;

    const fullPrompt = `
      ${enhancedPrompt}
      
      ASCII BLUEPRINT MAP (${WIDTH}x${HEIGHT}):
      ${asciiBlueprint}
      
      COMMAND: ${config.inputPixels ? "Refine the attached sprite." : "Translate this ASCII map into colored pixels."}
      If the map has a structure symbol, THAT PIXEL MUST BE COLORED.
      
      ${config.entityData ? `
      CONTEXTUAL DATA (Use this to inform details, colors, and style):
      \`\`\`json
      ${JSON.stringify(config.entityData, null, 2)}
      \`\`\`
      ` : ""}
    `;

    // Construct Parts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [{ text: fullPrompt }];

    // Image Injection
    if (config.inputPixels && config.inputPixels.length > 0) {
        try {
            const pngBuffer = this.pixelsToPng(config.inputPixels);
            const base64Image = pngBuffer.toString('base64');
            strapi.log.info(`Gemini Forge: Injecting Reference Image (${base64Image.length} chars)`);
            contents.push({
                inlineData: {
                    mimeType: "image/png",
                    data: base64Image
                }
            });
        } catch (e) {
            strapi.log.warn("Failed to process inputPixels for Vision", e);
        }
    }

    try {
      strapi.log.info(`Gemini Forge: Sending Request to ${modelId}...`);
      // SDK might not support direct timeout in config object, so strictly relying on internal fetch defaults
      // But we can try passing it if the SDK allows requestOptions. 
      // For now, let's just log before/after safely.
      
      const response = await ai.models.generateContent({
        model: modelId,
        contents: contents, 
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      });
      strapi.log.info(`Gemini Forge: Response Received.`);

      const safeJson = this.cleanJson(response.text || "");
      let rawData;
      try {
          rawData = JSON.parse(safeJson);
      } catch {
          throw new Error("Failed to parse pixel grid from model response.");
      }
      
      const validatedData = this.validateAndRepairGrid(rawData, WIDTH, HEIGHT);
      const cleanData = this.postProcessPixelData(validatedData, config.blueprint);

      return { pixelData: cleanData, enhancedPrompt };

    } catch (error) {
       strapi.log.error("Gemini Forge Error", error);
       throw error;
    }
  },

  async generateBlueprint(config: GenerationConfig) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

      const width = config.width || 32;
      const height = config.height || 32;
      
      const ai = new GoogleGenAI({ apiKey });
      const modelId = config.model || 'gemini-3-pro-preview';

      const prompt = `
          ACT AS A BLUEPRINT ARCHITECT.
          Task: Create a structural blueprint for a "${config.prompt}".
          Context: Pixel Art RPG Asset (${config.archetype}).
          Grid Size: ${width}x${height}.

          LEGEND (Use strictly these characters):
          - '#' : Body / Surface / Core Structure
          - 'O' : Head / Top Feature
          - 'X' : Weapon / dangerous part
          - 'l' : Left Hand / Side
          - 'r' : Right Hand / Side
          - 'L' : Legs / Base / Bottom
          - '+' : Accessory / Decoration
          - '.' : Empty Space (Transparent)

          INSTRUCTIONS:
          1. Output a JSON array of strings.
          2. Each string represents a ROW of ${width} characters.
          3. Total ${height} rows.
          4. Center the object in the grid.
          5. Use '.' for empty space.
          6. Draw a clear silhouette using the Legend characters.
          
          ${config.entityData ? `
          CONTEXTUAL DATA:
          \`\`\`json
          ${JSON.stringify(config.entityData, null, 2)}
          \`\`\`
          ` : ""}
      `;

      try {
          const response = await ai.models.generateContent({
            model: modelId,
            contents: [{ text: prompt }],
            config: {
                // Return array of strings (rows)
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
          });

          const safeJson = this.cleanJson(response.text || "");
          const rawData = JSON.parse(safeJson);
          
          // Use same validator but output is effectively zone map
          const validatedGrid = this.validateAndRepairGrid(rawData, width, height);
          
          const charToZone: Record<string, string> = {
              '#': 'core', 'O': 'head', 'X': 'weapon', 
              'l': 'hand_l', 'r': 'hand_r', 'L': 'legs', 
              '+': 'accessory', '.': 'none'
          };
          
          // SCHEMATIC COLORS (Visual Representation of Metadata)
          const zoneToColor: Record<string, string> = {
              'core': '#8B4513',      // SaddleBrown
              'head': '#FFD700',      // Gold
              'hand_l': '#FFA07A',    // LightSalmon
              'hand_r': '#FFA07A',    // LightSalmon
              'weapon': '#C0C0C0',    // Silver
              'legs': '#2F4F4F',      // DarkSlateGray
              'accessory': '#EE82EE', // Violet
              'none': 'transparent'
          };
          
          const visualGrid = validatedGrid.map(row => 
              row.map(char => {
                  const zone = charToZone[char] || 'none';
                  return zoneToColor[zone] || 'transparent';
              })
          );

          // Return 'pixelData' even for blueprint so normal canvas works
          // Return raw 'validatedGrid' (Chars) as blueprint metadata
          return { pixelData: visualGrid, blueprint: validatedGrid };

      } catch (e) {
          strapi.log.error("Blueprint Gen Error", e);
          throw e;
      }
  },

  async generateVoxelStructure(config: GenerationConfig) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

      const width = config.width || 16;
      const height = config.width || 16; // Square base usually
      const depth = 7; // Fixed depth for now
      
      const ai = new GoogleGenAI({ apiKey });
      const modelId = config.model || 'gemini-1.5-flash-latest';

      const prompt = `
          ACT AS A VOXEL ARCHITECT.
          Task: Create a 3D Voxel Structure for a "${config.prompt}".
          Context: RPG Construction / Building / Object.
          Dimensions: ${width}x${width}x${depth} (X, Y, Z).
          
          BLOCK TYPES ALLOWED:
          - stone, dirt, grass, wood, plank, sand, water, glass, leaf, coal, iron, gold, diamond, redstone
          
          INSTRUCTIONS:
          1. Output specific JSON format: Array of { x, y, z, block }.
          2. Coordinate System: 
             - X: 0 to ${width-1}
             - Y: 0 to ${width-1}
             - Z: 0 to ${depth-1} (0 is bottom, ${depth-1} is top)
          3. Only list non-air blocks.
          4. Create a coherent structure matching the prompt.
          5. Ensure structural integrity (blocks shouldn't floating illogically unless magical).
          
          ${config.entityData ? `
          CONTEXTUAL DATA:
          \`\`\`json
          ${JSON.stringify(config.entityData, null, 2)}
          \`\`\`
          ` : ""}
      `;

      try {
          const response = await ai.models.generateContent({
            model: modelId,
            contents: [{ text: prompt }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.INTEGER },
                            y: { type: Type.INTEGER },
                            z: { type: Type.INTEGER },
                            block: { type: Type.STRING }
                        },
                        required: ["x", "y", "z", "block"]
                    }
                }
            }
          });

          const safeJson = this.cleanJson(response.text || "");
          const rawData = JSON.parse(safeJson);
          
          // Validate Bounds
          const validatedVoxels = rawData.filter((v: any) => 
               v.x >= 0 && v.x < width &&
               v.y >= 0 && v.y < height &&
               v.z >= 0 && v.z < depth &&
               v.block && typeof v.block === 'string'
          );

          return { voxelData: validatedVoxels };

      } catch (e) {
          strapi.log.error("Voxel Gen Error", e);
          throw e;
      }
  },

  enhancePrompt(rawPrompt: string, type: AssetType, archetype: Archetype): string {
    const baseStyle = "Style: Masterpiece 16-bit pixel art, fantasy D&D RPG aesthetic, vibrant colors, high contrast, clean distinct pixels.";
    
    if (TERMS.TERRAIN.includes(archetype) || type === 'Terrain' || type === 'Environment') {
        return `Task: Create a seamless, tiling texture for a "${rawPrompt}". Context: Top-down RPG map tile. Details: The pattern MUST be seamless. ${baseStyle}`;
    }
    
    if (TERMS.ITEM.includes(archetype) || type === 'Item') {
        return `Task: Create an iconic inventory sprite of a "${rawPrompt}". Context: Legendary RPG item. Details: Centered, fits within 32x32. ${baseStyle}`;
    }
    
    if (type === 'Monster' || type === 'Race' || type === 'Sprite') {
        return `Task: Create a character sprite of a "${rawPrompt}". Context: RPG Battle Sprite. Details: Dynamic top-down/isometric perspective. Strong silhouette. ${baseStyle}`;
    }

    return `Create a pixel art asset: "${rawPrompt}". ${baseStyle}`;
  },

  gridToAscii(blueprint?: ZoneType[][]): string {
    if (!blueprint || !Array.isArray(blueprint)) return "................................\\n".repeat(32); // Empty grid if none provided
    const map: Record<string, string> = {
        'none': '.',
        'core': '#',
        'head': 'O',
        'hand_l': 'l',
        'hand_r': 'r',
        'weapon': 'X',
        'legs': 'L',
        'back': 'B',
        'accessory': '+'
    };
    return blueprint.map(row => row.map(cell => map[cell] || '.').join('')).join('\n');
  },

  cleanJson(text: string): string {
    if (!text) return "[]";
    let clean = text.replace(/```json/g, '').replace(/```/g, '');
    const start = clean.indexOf('[');
    const end = clean.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      clean = clean.substring(start, end + 1);
    }
    clean = clean.replace(/'/g, '"');
    return clean;
  },

  validateAndRepairGrid(data: unknown, width = 32, height = 32): string[][] {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let grid = data as any; // Safe internal cast
      if (!Array.isArray(grid)) return Array(height).fill(Array(width).fill('transparent'));

      // Case: Flattened
      if (grid.length > height && !Array.isArray(grid[0])) {
          const newGrid = [];
          const chunkSize = width;
          for (let i = 0; i < grid.length; i += chunkSize) {
              if (newGrid.length >= height) break;
              newGrid.push(grid.slice(i, i + chunkSize));
          }
          grid = newGrid;
      }

      // Repair Dimensions
      if (grid.length > height) grid = grid.slice(0, height);
      while (grid.length < height) grid.push(Array(width).fill('transparent'));

      grid = grid.map((row) => {
          if (!Array.isArray(row)) return Array(width).fill('transparent');
          let newRow = [...row];
          if (newRow.length > width) newRow = newRow.slice(0, width);
          while (newRow.length < width) newRow.push('transparent');
          return newRow.map((cell) => (typeof cell === 'string' ? cell : 'transparent'));
      });

      return grid;
  },

  postProcessPixelData(generated: string[][], _blueprint?: ZoneType[][]): string[][] {
    return generated.map((row, _y) => 
        row.map((color, _x) => {
            // Strict RGBA: If AI returns transparent, it stays transparent.
            // We do NOT backfill with 'FALLBACK_COLORS' based on blueprint.
            // ASCII map is for guidance, not a coloring book.
            return color || 'transparent'; 
        })
    );
  },

  pixelsToPng(grid: string[][]): Buffer {
      const width = grid[0]?.length || 32;
      const height = grid.length || 32;
      const png = new PNG({ width, height });

      for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
              const color = grid[y]?.[x] || 'transparent';
              const idx = (width * y + x) << 2;

              let r = 0, g = 0, b = 0, a = 0;

              if (color !== 'transparent' && color !== 'none') {
                  const rgb = this.hexToRgb(color);
                  if (rgb) {
                      r = rgb.r;
                      g = rgb.g;
                      b = rgb.b;
                      a = 255;
                  }
              }

              png.data[idx] = r;
              png.data[idx + 1] = g;
              png.data[idx + 2] = b;
              png.data[idx + 3] = a;
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
  }
});
