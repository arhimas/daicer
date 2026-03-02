import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { PNG } from 'pngjs';
import { PromptKey, PromptVariableMap, PromptSchemas } from '@daicer/llm-core/prompt-registry';
import { ContextBuilder } from '@daicer/llm-core/context/builder';
import { StrapiAdapter, LLMCoreConfig } from '@daicer/llm-core/types';

// Types
export type ZoneType = 'core' | 'head' | 'hand_l' | 'hand_r' | 'weapon' | 'back' | 'legs' | 'accessory' | 'none';
export type AssetType = 'Monster' | 'Item' | 'Race' | 'Environment' | 'Terrain' | 'Sprite' | 'Blueprint';
export type Archetype = string;

/**
 * Configuration for Pixel and Blueprint Generation.
 * Defines the physical and semantic properties of the entity to be manifested.
 */
export interface GenerationConfig {
  /** The core instruction text. */
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
  ITEM: [
    'Sword',
    'Polearm',
    'Shield',
    'Headwear',
    'Body Armor',
    'Legwear',
    'Handwear',
    'Footwear',
    'Accessory',
    'Item',
  ],
};

/**
 * **Gemini Pixel Forge Service**
 * Powered by LangChain, Zod, ContextBuilder & Gemini 3
 * with Hardened Variable Injection
 */
export default (init: { adapter: StrapiAdapter; config: LLMCoreConfig }) => {
  const { adapter, config } = init;

  const getContentTypeUid = (key: keyof LLMCoreConfig['contentTypes']) => config.contentTypes?.[key];

  const service = {
    // Helper to reference methods internally

    /**
     * Initializes the Google GenAI Chat Model via LangChain.
     * @param modelId - The specific model identifier (e.g., 'gemini-3-pro-preview').
     * @returns LangChain ChatGoogleGenerativeAI instance.
     */
    async getModel(modelId: string) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

      return new ChatGoogleGenerativeAI({
        model: modelId,
        apiKey,
        temperature: 0.5,
        maxRetries: 2,
      });
    },

    /**
     * Retrieves the Prompt Template from the Single Source of Truth (DB).
     * Enforces existence - no fallbacks allowed.
     * @param key - The strictly typed execution key.
     */
    async getPromptTemplate<K extends PromptKey>(key: K): Promise<PromptTemplate> {
      try {
        const uid = getContentTypeUid('prompt');
        if (!uid) throw new Error('Prompt Content Type UID not configured in LLMCoreConfig');

        const entry = await adapter.db.query(uid).findOne({
          where: { key },
        });

        if (!entry || !entry.text) {
          adapter.log.error(`CRITICAL: Prompt '${key}' missing in DB.`);
          throw new Error(`State of Art Enforcement: Prompt '${key}' MUST exist in Strapi DB. No fallbacks allowed.`);
        }

        return PromptTemplate.fromTemplate(entry.text);
      } catch (e) {
        adapter.log.error(`Failed to fetch prompt '${key}'`, e);
        throw e;
      }
    },

    /**
     * **Hardened Format Prompt**
     * Enforces strict Zod Schema Validation against the `prompts.json` contract.
     *
     * @param key - The prompt key (e.g., 'system-identity').
     * @param variables - The variables object. MUST match the Zod schema for this key.
     * @throws ZodError if variables do not match schema.
     */
    async formatPrompt<K extends PromptKey>(key: K, variables: PromptVariableMap[K]): Promise<string> {
      // 1. Runtime Validation
      const schema = PromptSchemas[key];
      if (!schema) throw new Error(`Missing Zod Schema for prompt key: ${key}`);

      const validatedVariables = schema.parse(variables) as PromptVariableMap[K];

      // 2. Formatting
      const template = await service.getPromptTemplate(key);
      return await template.format(validatedVariables);
    },

    async generatePixelData(genConfig: GenerationConfig) {
      // Dispatcher
      if (genConfig.type === 'Blueprint' || genConfig.action === 'generate_blueprint') {
        return service.generateBlueprint(genConfig);
      }

      if (genConfig.action === 'generate_voxel') {
        return service.generateVoxelStructure(genConfig);
      }

      const WIDTH = genConfig.width || 32;
      const HEIGHT = genConfig.height || 32;
      const modelId = genConfig.model || 'gemini-3-flash-preview';
      const contextBuilder = new ContextBuilder(adapter, config);

      const isTerrain =
        TERMS.TERRAIN.includes(genConfig.archetype) || genConfig.type === 'Terrain' || genConfig.type === 'Environment';
      const isItem = TERMS.ITEM.includes(genConfig.archetype) || genConfig.type === 'Item';

      // 1. Enhancement Phase (Prompt Passthrough)
      const enhancedPrompt = genConfig.prompt;

      // 2. Size & Framing Logic
      const size = genConfig.size || 'Medium';
      let framingInstruction = `FITTING: Fill the ${WIDTH}x${HEIGHT} grid comfortably.`;

      if (WIDTH > 32 || HEIGHT > 32) {
        framingInstruction = `
       FITTING: LARGE ENTITY (${WIDTH}x${HEIGHT}). 
       - UTILIZE the extra space for detail.
       - IMPORTANT: The subject MUST be centered in the ${WIDTH}x${HEIGHT} canvas.
       - If the subject is 'Gargantuan', fill the canvas to the edges.
       `;
      } else if (['Tiny', 'Small'].includes(size)) {
        framingInstruction = 'FITTING: CENTER the object within the middle 16x16 pixels. LEAVE TRANSPARENT PADDING.';
      }

      let specificInstruction = '';
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

      // 3. SOTA Context Injection
      const contextDataString = await contextBuilder.buildEntityContext({
        entityContext: genConfig.entityContext,
        entityData: genConfig.entityData,
        prompt: genConfig.prompt,
        type: genConfig.type,
        archetype: genConfig.archetype,
        width: WIDTH,
        height: HEIGHT,
        size,
      });

      // 4. Vision Pipeline
      const { instruction: visionInstruction, zoneMap: dynamicZoneMap } = await contextBuilder.buildVisionContext();

      // Render Vision Input
      let visionBuffer: Buffer;

      if (genConfig.inputPixels && genConfig.inputPixels.length > 0) {
        visionBuffer = service.pixelsToPng(genConfig.inputPixels, 2);
      } else if (genConfig.blueprint) {
        const blueprintPixels = service.blueprintToPixels(genConfig.blueprint, dynamicZoneMap);
        visionBuffer = service.pixelsToPng(blueprintPixels, 2);
      } else {
        visionBuffer = service.pixelsToPng(Array(HEIGHT).fill(Array(WIDTH).fill('transparent')));
      }

      const contentParts: { type: 'text' | 'image_url'; text?: string; image_url?: string }[] = [
        { type: 'text', text: 'Manifest this sprite based on the visual input structure.' },
        {
          type: 'image_url',
          image_url: `data:image/png;base64,${visionBuffer.toString('base64')}`,
        },
      ];

      // 5. Fetch Main System Template with Hardened Validation
      const formattedSystemPrompt = await service.formatPrompt('pixel-forge-system', {
        width: WIDTH,
        height: HEIGHT,
        specificInstruction,
        enhancedPrompt: enhancedPrompt,
        visionInstruction,
        contextData: contextDataString,
        asciiBlueprint: undefined, // Optional in schema
      });

      try {
        const model = await service.getModel(modelId);

        const PixelGridSchema = z.object({
          pixelData: z
            .array(z.array(z.string()))
            .describe(`A ${HEIGHT}x${WIDTH} grid of hex color strings or 'transparent'`),
        });

        const modelWithStructure = model.withStructuredOutput(PixelGridSchema);

        const response = await modelWithStructure.invoke([
          new SystemMessage(formattedSystemPrompt),
          new HumanMessage({ content: contentParts }),
        ]);

        const rawGrid = response.pixelData;
        const validatedData = service.validateAndRepairGrid(rawGrid, WIDTH, HEIGHT);
        const cleanData = service.postProcessPixelData(validatedData);

        return { pixelData: cleanData, effectivePrompt: enhancedPrompt };
      } catch (error) {
        adapter.log.error('Gemini Forge LangChain Error', error);
        throw error;
      }
    },

    async generateBlueprint(genConfig: GenerationConfig) {
      const width = genConfig.width || 32;
      const height = genConfig.height || 32;
      const modelId = genConfig.model || 'gemini-3-pro-preview';
      // Unused in blueprint logic directly, but ready if needed
      // const contextBuilder = new ContextBuilder(adapter, config);

      // Title Cleaning (User Request: "Clean Name")
      // e.g. "Humanoid_Large_axe" -> "Large Axe Fighter"
      // e.g. "[Weapon] - Great Sword" -> "Great Sword"
      // Title Cleaning (User Request: "Clean Name")
      // e.g. "Humanoid_Large_axe" -> "Large Axe Fighter"
      // e.g. "[Weapon] - Great Sword" -> "Great Sword"
      const cleanedName = genConfig.prompt
        .replace(/^\[.*?\]\s*-\s*/, '') // Remove [Category] - Prefix
        .replace(/_/g, ' ')
        .trim();

      // ---------------------------------------------------------
      // 0. PREPARATION
      // ---------------------------------------------------------
      const archetypeMap: Record<string, string> = {
        Humanoid: 'Creature',
        Monster: 'Creature',
        Weapon: 'Item',
        Armor: 'Item',
        Potion: 'Item',
        Structure: 'Structure',
        Terrain: 'Terrain',
        Environment: 'Terrain',
      };

      const targetCategory = archetypeMap[genConfig.archetype] || genConfig.type || 'Creature';

      // ---------------------------------------------------------
      // 1. DYNAMIC BLUEPRINT LIST (Source of Truth: api::blueprint)
      // ---------------------------------------------------------
      const blueprintUid = config.contentTypes.blueprint;
      let genericBlueprintsList: string[] = ['humanoid', 'sword', 'shield'];

      if (blueprintUid) {
        try {
          const dbBlueprints = await adapter.db.query(blueprintUid).findMany({
            select: ['name'],
            limit: 100,
          });
          if (dbBlueprints && dbBlueprints.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            genericBlueprintsList = dbBlueprints.map((b: any) => b.name);
          }
        } catch (e) {
          adapter.log.warn('Failed to fetch Blueprints for generic list', e);
        }
      }

      const rawName = `
      USER REQUEST: "${cleanedName}"
      
      MANDATE: You must generalize this request. 
      The blueprint MUST be one of the following generic types found in our Database:
      [${genericBlueprintsList.join(', ')}].

      1. Identify the closest match from the list. 
      2. Generate the blueprint for that GENERIC type (e.g. if 'Human Fighter', generate 'humanoid').
      `;

      // Sanitization: Remove bulk data (grids/pixels) to prevent context poisoning
      let contextData = '';
      if (genConfig.entityData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { grid, pixels, blueprint, localizations, history, ...semanticData } = genConfig.entityData;
        contextData = `CONTEXT: ${JSON.stringify(semanticData)}`;
      }

      try {
        const model = await service.getModel(modelId);

        // ---------------------------------------------------------
        // 2. DYNAMIC ZONE CONFIGURATION (Source of Truth: api::entity-zone)
        // ---------------------------------------------------------
        const zoneUid = config.contentTypes.zone;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let validZones: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const zoneColors: Record<string, string> = {}; // Kept for reference if needed, but we rely on validZones now

        try {
          if (zoneUid) {
            validZones = await adapter.db.query(zoneUid).findMany({
              select: ['id', 'slug', 'color', 'symbol', 'description', 'category', 'name'],
              limit: 100,
            });

            if (validZones.length === 0) {
              adapter.log.error('CRITICAL: No Entity Zones found in DB. Please run seed.');
            }
          }
        } catch (e) {
          adapter.log.error('Failed to fetch Entity Zones from DB', e);
        }

        // Build Legend from Valid Zones
        let zoneInstruction = 'STRICT LEGEND (Symbol -> Meaning):\n- . : Empty Space\n';
        const allowedChars = ['.'];
        const charToZone: Record<string, string> = { '.': 'none' };
        const zoneToColor: Record<string, string> = { none: 'transparent' };

        // Add # (Solid) as default fallback just in case, but rely on DB zones primarily
        if (validZones.length === 0) {
          zoneInstruction += `- # : Solid Form\n`;
          allowedChars.push('#');
          charToZone['#'] = 'core';
          zoneToColor['core'] = '#FFFFFF';
        } else {
          // Filter zones roughly by category
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const relevantZones = validZones.filter((z: any) => z.category === targetCategory || z.slug === 'custom');
          const zonesToUse = relevantZones.length > 0 ? relevantZones : validZones;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          zonesToUse.forEach((z: any) => {
            const symbol = z.symbol || '#';
            if (!allowedChars.includes(symbol)) {
              allowedChars.push(symbol);
              zoneInstruction += `- ${symbol} : ${z.name}\n`;
              charToZone[symbol] = z.slug;
              zoneToColor[z.slug] = z.color;
            }
          });
        }

        // ---------------------------------------------------------
        // 3. DYNAMIC SIZE RULES (Source of Truth: api::size.size)
        // ---------------------------------------------------------
        let sizeInstruction = '';
        try {
          const sizeUid = 'api::size.size'; // Or config.contentTypes.size if available
          const targetSize = (genConfig.size || 'Medium').toLowerCase();

          // Find specific size rule
          const sizeEntity = await adapter.db.query(sizeUid).findOne({
            where: { slug: targetSize },
            select: ['instruction', 'name'],
          });

          if (sizeEntity && sizeEntity.instruction) {
            sizeInstruction = `
          ${sizeEntity.instruction}

          TARGET SIZE: ${sizeEntity.name.toUpperCase()} (Confirmed from DB)
          `;
          } else {
            // Fallback or warning?
            // If the specific size isn't found, we might want to fetch 'Medium' as default?
            // Or just warn.
            adapter.log.warn(`Size definition for '${targetSize}' not found in DB.`);

            // Attempt to fetch 'medium' as fallback if target wasn't found
            const defaultSize = await adapter.db.query(sizeUid).findOne({
              where: { slug: 'medium' },
              select: ['instruction'],
            });
            if (defaultSize) {
              sizeInstruction = `
                ${defaultSize.instruction}
                
                NOTE: Requested size '${targetSize}' not found. Applied 'Medium' rules as fallback.
                `;
            }
          }
        } catch (e) {
          adapter.log.warn('Failed to fetch Size Definition from DB', e);
        }

        // Strict Validation via PromptSchemas
        const formattedPrompt = await service.formatPrompt('blueprint-architect', {
          prompt: rawName,
          archetype: genConfig.archetype || 'entity',
          width,
          height,
          contextData: `${contextData}\n\n${zoneInstruction}\n${sizeInstruction}\nCRITICAL: You must ONLY use the symbols listed in the Legend above.`,
        });

        const BlueprintSchema = z.object({
          blueprint: z
            .array(z.string())
            .describe(
              `Array of ${height} strings. Each string must be exactly ${width} characters long. ALLOWED CHARACTERS: [${allowedChars.join(', ')}]`
            ),
        });

        const modelWithStructure = model.withStructuredOutput(BlueprintSchema);
        const response = await modelWithStructure.invoke(formattedPrompt);

        const rows = response.blueprint;
        const grid = rows.map((r) => r.split(''));
        const validatedGrid = service.validateAndRepairGrid(grid, width, height);

        const uniqueZones = new Set<string>();

        const visualGrid = validatedGrid.map((row) =>
          row.map((char) => {
            let slug = charToZone[char];
            let color = 'transparent';

            if (slug) {
              color = zoneToColor[slug] || 'transparent';
            } else {
              const z = validZones.find((z: { symbol: string }) => z.symbol === char);
              if (z) {
                slug = z.slug;
                color = z.color;
              }
            }

            if (slug && slug !== 'none') {
              uniqueZones.add(slug);
            }

            return color;
          })
        );

        return {
          pixelData: visualGrid,
          blueprint: validatedGrid,
          zones: Array.from(uniqueZones),
        };
      } catch (e) {
        adapter.log.error('Blueprint Gen Error', e);
        throw e;
      }
    },

    async generateVoxelStructure(genConfig: GenerationConfig) {
      const width = genConfig.width || 16;
      const height = genConfig.width || 16;
      const depth = 7;
      const modelId = genConfig.model || 'gemini-3-flash-preview';
      const contextData = genConfig.entityData ? `CONTEXT: ${JSON.stringify(genConfig.entityData)}` : '';

      try {
        const model = await service.getModel(modelId);
        const formattedPrompt = await service.formatPrompt('voxel-architect', {
          prompt: genConfig.prompt,
          width,
          depth,
          contextData,
        });

        const VoxelSchema = z.object({
          voxelData: z.array(
            z.object({
              x: z
                .number()
                .int()
                .min(0)
                .max(width - 1),
              y: z
                .number()
                .int()
                .min(0)
                .max(height - 1),
              z: z
                .number()
                .int()
                .min(0)
                .max(depth - 1),
              block: z.string(),
            })
          ),
        });

        const modelWithStructure = model.withStructuredOutput(VoxelSchema);
        const response = await modelWithStructure.invoke(formattedPrompt);

        return { voxelData: response.voxelData };
      } catch (e) {
        adapter.log.error('Voxel Gen Error', e);
        throw e;
      }
    },

    async generateStructuredData<K extends PromptKey, T>(config: {
      promptKey: K;
      variables: PromptVariableMap[K];
      schema: z.ZodSchema<T>;
      modelId?: string;
    }) {
      const modelId = config.modelId || 'gemini-3-pro-preview';
      try {
        const model = await service.getModel(modelId);

        const formattedPrompt = await service.formatPrompt(config.promptKey, config.variables);

        const modelWithStructure = model.withStructuredOutput(config.schema);

        const response = await modelWithStructure.invoke(formattedPrompt);

        return response;
      } catch (e) {
        adapter.log.error(`Structured Gen Error (${config.promptKey})`, e);
        throw e;
      }
    },

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
      return generated.map((row) => row.map((color) => color || 'transparent'));
    },

    blueprintToPixels(
      blueprint: ZoneType[][],
      customMap?: Record<string, string>,
      injectedZones?: Record<string, string>
    ): string[][] {
      if (!blueprint) return [];

      // Combine defaults with optional injected zones (from DB) and custom map
      const ZONE_COLORS: Record<string, string> = {
        core: '#FFFFFF',
        head: '#FFFF00',
        weapon: '#FF0000',
        legs: '#0000FF',
        hand_l: '#00FF00',
        hand_r: '#00FF00',
        accessory: '#FF00FF',
        none: 'transparent',
        '.': 'transparent',
        '#': '#FFFFFF',
        ...(injectedZones || {}),
        ...(customMap || {}),
      };

      return blueprint.map((row) =>
        row.map((cell) => {
          // If it's already a valid Hex Color (e.g. user manually painted it in PixelForge)
          if (/^#[0-9A-Fa-f]{3,8}$/.test(cell)) return cell;
          
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
          const sourceX = Math.floor(x / scale);
          const sourceY = Math.floor(y / scale);

          const color = grid[sourceY]?.[sourceX] || 'transparent';
          const idx = (width * y + x) << 2;
          let r = 0,
            g = 0,
            b = 0,
            a = 0;

          if (color !== 'transparent' && color !== 'none') {
            const rgb = service.hexToRgb(color);
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

    hexToRgb(hex: string): { r: number; g: number; b: number } | null {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    },
  };

  return service;
};
