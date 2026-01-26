import { GoogleGenAI, Type } from "@google/genai";

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
}

const FALLBACK_COLORS: Record<string, string> = {
    'core': '#5D4037',      // Wood/Leather/Dark Body
    'head': '#FFCC80',      // Skin/Helmet
    'hand_l': '#FFCC80',    // Skin
    'hand_r': '#FFCC80',    // Skin
    'weapon': '#CFD8DC',    // Steel
    'legs': '#3E2723',      // Dark Leather
    'back': '#90A4AE',      // Cloak/Wings
    'accessory': '#FFD700', // Gold
    'none': 'transparent'
};

const TERMS = {
    TERRAIN: ['Solid Block', 'Landscape/Floor', 'Terrain', 'Environment'],
    ITEM: ['Sword', 'Polearm', 'Shield', 'Headwear', 'Body Armor', 'Legwear', 'Handwear', 'Footwear', 'Accessory', 'Item']
};

/**
 * **Gemini Pixel Forge Service**
 * 
 * Orchestrates the generation of 32x32 pixel sprites using Google's Gemini Flash 1.5.
 * Features robustness strategies including JSON repair, grid padding, and anatomy-aware post-processing.
 * 
 * 📖 **Manual**: [Pixel Forge Documentation](../../README.md#pixel-forge)
 */
export default ({ strapi }) => ({
  /**
   * Generates pixel data for a requested entity/terrain.
   * 
   * **Flow**:
   * 1. Constructs a context-aware prompt (Entity Type + Archetype).
   * 2. Renders an ASCII blueprint layout to guide the LLM's spatial reasoning.
   * 3. Calls Gemini API with strict JSON schema.
   * 4. Repairs and Validates the output grid (Self-Healing).
   * 
   * @param {GenerationConfig} config - The configuration payload.
   * @returns {Promise<{ pixelData: string[][], enhancedPrompt: string }>} The generated 32x32 grid.
   */
  async generatePixelData(config: GenerationConfig) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
    
    const ai = new GoogleGenAI({ apiKey });
    const modelId = config.model || 'gemini-1.5-flash-latest'; // Default if not specified

    const isTerrain = TERMS.TERRAIN.includes(config.archetype) || config.type === 'Terrain' || config.type === 'Environment';
    const isItem = TERMS.ITEM.includes(config.archetype) || config.type === 'Item';
    
    const enhancedPrompt = this.enhancePrompt(config.prompt, config.type, config.archetype);

    let specificInstruction = "";
    if (isTerrain) {
        specificInstruction = `
        MODE: TERRAIN / TEXTURE GENERATION
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
        - The ASCII Grid below represents the object's shape.
        - '#' = Handle/Shaft
        - 'X' = Blade/Head
        - '+' = Guard/Decoration
        - 'O' = Top/Head
        - 'L' = Bottom/Base
        
        CRITICAL: FILL EVERY SYMBOL in the grid with a non-transparent color.
        `;
    } else {
        specificInstruction = `
        MODE: CREATURE GENERATION
        - The ASCII Grid below represents the creature's anatomy.
        - 'O' = Head
        - '#' = Torso
        - 'r'/'l' = Hands
        - 'L' = Legs
        
        CRITICAL: FILL the anatomy with colors matching the description.
        `;
    }

    const asciiBlueprint = this.gridToAscii(config.blueprint);

    const systemInstruction = `
      You are a Pixel Art Engine. 
      Your goal is to fill a 32x32 grid with hex colors based on an ASCII structural map.
      
      RULES:
      1. OUTPUT: JSON array of 32 arrays (rows). Each row contains 32 hex strings.
      2. BACKGROUND: Use "transparent" for '.' (dots) in the ASCII map.
      3. FOREGROUND: You MUST provide a hex color (e.g., "#FF0000") for every non-dot character in the map.
      4. STYLE: High contrast, vivid fantasy RPG style. 32x32 resolution.
      
      ${specificInstruction}
    `;

    const fullPrompt = `
      ${enhancedPrompt}
      
      ASCII BLUEPRINT MAP (32x32):
      ${asciiBlueprint}
      
      COMMAND: Translate this ASCII map into colored pixels. 
      If the map has a structure symbol, THAT PIXEL MUST BE COLORED.
    `;

    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: fullPrompt,
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

      const safeJson = this.cleanJson(response.text || "");
      let rawData;
      try {
          rawData = JSON.parse(safeJson);
      } catch {
          throw new Error("Failed to parse pixel grid from model response.");
      }
      
      const validatedData = this.validateAndRepairGrid(rawData);
      const cleanData = this.postProcessPixelData(validatedData, config.blueprint);

      return { pixelData: cleanData, enhancedPrompt };

    } catch (error) {
       strapi.log.error("Gemini Forge Error", error);
       throw error;
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

  gridToAscii(blueprint: ZoneType[][]): string {
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

  validateAndRepairGrid(data: unknown): string[][] {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let grid = data as any; // Safe internal cast
      if (!Array.isArray(grid)) return Array(32).fill(Array(32).fill('transparent'));

      // Case: Flattened
      if (grid.length > 32 && !Array.isArray(grid[0])) {
          const newGrid = [];
          const chunkSize = 32;
          for (let i = 0; i < grid.length; i += chunkSize) {
              if (newGrid.length >= 32) break;
              newGrid.push(grid.slice(i, i + chunkSize));
          }
          grid = newGrid;
      }

      // Repair Dimensions
      if (grid.length > 32) grid = grid.slice(0, 32);
      while (grid.length < 32) grid.push(Array(32).fill('transparent'));

      grid = grid.map((row) => {
          if (!Array.isArray(row)) return Array(32).fill('transparent');
          let newRow = [...row];
          if (newRow.length > 32) newRow = newRow.slice(0, 32);
          while (newRow.length < 32) newRow.push('transparent');
          return newRow.map((cell) => (typeof cell === 'string' ? cell : 'transparent'));
      });

      return grid;
  },

  postProcessPixelData(generated: string[][], blueprint: ZoneType[][]): string[][] {
    return generated.map((row, y) => 
        row.map((color, x) => {
            const zone = blueprint[y]?.[x] || 'none';
            const isTransparent = !color || color === 'transparent' || color === 'none';
            if (!isTransparent) return color;
            if (zone !== 'none') {
                return FALLBACK_COLORS[zone] || '#808080';
            }
            return 'transparent';
        })
    );
  }
});
