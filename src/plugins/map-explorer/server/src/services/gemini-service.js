"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_genai_1 = require("@langchain/google-genai");
const messages_1 = require("@langchain/core/messages");
const prompts_1 = require("@langchain/core/prompts");
const zod_1 = require("zod");
const pngjs_1 = require("pngjs");
const prompt_registry_1 = require("./prompt-registry");
const context_builder_1 = require("./context-builder");
const TERMS = {
    TERRAIN: ['Solid Block', 'Landscape/Floor', 'Terrain', 'Environment'],
    ITEM: ['Sword', 'Polearm', 'Shield', 'Headwear', 'Body Armor', 'Legwear', 'Handwear', 'Footwear', 'Accessory', 'Item']
};
/**
 * **Gemini Pixel Forge Service**
 * Powered by LangChain, Zod, ContextBuilder & Gemini 3
 * with Hardened Variable Injection
 */
exports.default = ({ strapi }) => {
    const getConfig = (key) => strapi.plugin('map-explorer').config('contentTypes')[key];
    return {
        async getModel(modelId) {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey)
                throw new Error("GEMINI_API_KEY not configured");
            return new google_genai_1.ChatGoogleGenerativeAI({
                model: modelId,
                apiKey,
                temperature: 0.5,
                maxRetries: 2
            });
        },
        async getPromptTemplate(key) {
            try {
                const uid = getConfig('prompt');
                const entry = await strapi.db.query(uid).findOne({
                    where: { key }
                });
                if (!entry || !entry.text) {
                    strapi.log.error(`CRITICAL: Prompt '${key}' missing in DB.`);
                    throw new Error(`State of Art Enforcement: Prompt '${key}' MUST exist in Strapi DB. No fallbacks allowed.`);
                }
                return prompts_1.PromptTemplate.fromTemplate(entry.text);
            }
            catch (e) {
                strapi.log.error(`Failed to fetch prompt '${key}'`, e);
                throw e;
            }
        },
        /**
         * Hardened Format Prompt: Enforces Zod Schema Validation
         */
        async formatPrompt(key, variables) {
            // 1. Runtime Validation
            const schema = prompt_registry_1.PromptSchemas[key];
            if (!schema)
                throw new Error(`Missing Zod Schema for prompt key: ${key}`);
            const validatedVariables = schema.parse(variables);
            // 2. Formatting
            const template = await this.getPromptTemplate(key);
            return await template.format(validatedVariables);
        },
        async generatePixelData(config) {
            // Dispatcher
            if (config.type === 'Blueprint' || config.action === 'generate_blueprint') {
                return this.generateBlueprint(config);
            }
            if (config.action === 'generate_voxel') {
                return this.generateVoxelStructure(config);
            }
            const WIDTH = config.width || 32;
            const HEIGHT = config.height || 32;
            const modelId = config.model || 'gemini-3-flash-preview';
            const contextBuilder = new context_builder_1.ContextBuilder(strapi);
            const isTerrain = TERMS.TERRAIN.includes(config.archetype) || config.type === 'Terrain' || config.type === 'Environment';
            const isItem = TERMS.ITEM.includes(config.archetype) || config.type === 'Item';
            // 1. Enhancement Phase (Prompt Passthrough)
            const enhancedPrompt = config.prompt;
            // 2. Size & Framing Logic 
            // TODO: Move this to ContextBuilder.buildFramingInstruction in Phase 2
            const size = config.size || 'Medium';
            let framingInstruction = `FITTING: Fill the ${WIDTH}x${HEIGHT} grid comfortably.`;
            if (WIDTH > 32 || HEIGHT > 32) {
                framingInstruction = `
       FITTING: LARGE ENTITY (${WIDTH}x${HEIGHT}). 
       - UTILIZE the extra space for detail.
       - IMPORTANT: The subject MUST be centered in the ${WIDTH}x${HEIGHT} canvas.
       - If the subject is 'Gargantuan', fill the canvas to the edges.
       `;
            }
            else if (['Tiny', 'Small'].includes(size)) {
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
            }
            else if (isItem) {
                specificInstruction = `
        MODE: ITEM / OBJECT GENERATION
        - Scale: 32x32 pixels = 1 sq. ft.
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - ${framingInstruction}
        - '#' = Handle/Shaft, 'X' = Blade/Head...
        CRITICAL: FILL blueprinted pixels. Keep transparency outside the object.
        `;
            }
            else {
                specificInstruction = `
        MODE: CREATURE GENERATION
        - Scale: 32x32 pixels = 5 sq. ft (Standard).
        - Canvas Size: ${WIDTH}x${HEIGHT}.
        - ${framingInstruction}
        - CENTERING: Feet at Y=${Math.floor(HEIGHT * 0.8)}.
        CRITICAL: FILL the anatomy with colors matching the description.
        `;
            }
            // 3. SOTA Context Injection (Usage of ContextBuilder)
            const contextDataString = await contextBuilder.buildEntityContext({
                entityContext: config.entityContext,
                entityData: config.entityData,
                prompt: config.prompt,
                type: config.type,
                archetype: config.archetype,
                width: WIDTH,
                height: HEIGHT,
                size
            });
            // 4. Vision Pipeline (Usage of ContextBuilder)
            const { instruction: visionInstruction, zoneMap: dynamicZoneMap } = await contextBuilder.buildVisionContext();
            // Render Vision Input (Blueprint or Input Pixels)
            let visionBuffer;
            if (config.inputPixels && config.inputPixels.length > 0) {
                visionBuffer = this.pixelsToPng(config.inputPixels, 2);
            }
            else if (config.blueprint) {
                const blueprintPixels = this.blueprintToPixels(config.blueprint, dynamicZoneMap);
                visionBuffer = this.pixelsToPng(blueprintPixels, 2);
            }
            else {
                visionBuffer = this.pixelsToPng(Array(HEIGHT).fill(Array(WIDTH).fill('transparent')));
            }
            const contentParts = [
                { type: "text", text: "Manifest this sprite based on the visual input structure." },
                {
                    type: "image_url",
                    image_url: `data:image/png;base64,${visionBuffer.toString('base64')}`
                }
            ];
            // 5. Fetch Main System Template with Hardened Validation
            const formattedSystemPrompt = await this.formatPrompt('pixel-forge-system', {
                width: WIDTH,
                height: HEIGHT,
                specificInstruction,
                enhancedPrompt: enhancedPrompt,
                visionInstruction,
                contextData: contextDataString
            });
            try {
                const model = await this.getModel(modelId);
                const PixelGridSchema = zod_1.z.object({
                    pixelData: zod_1.z.array(zod_1.z.array(zod_1.z.string())).describe(`A ${HEIGHT}x${WIDTH} grid of hex color strings or 'transparent'`)
                });
                const modelWithStructure = model.withStructuredOutput(PixelGridSchema);
                const response = await modelWithStructure.invoke([
                    new messages_1.SystemMessage(formattedSystemPrompt),
                    new messages_1.HumanMessage({ content: contentParts })
                ]);
                const rawGrid = response.pixelData;
                const validatedData = this.validateAndRepairGrid(rawGrid, WIDTH, HEIGHT);
                const cleanData = this.postProcessPixelData(validatedData);
                return { pixelData: cleanData, effectivePrompt: enhancedPrompt };
            }
            catch (error) {
                strapi.log.error("Gemini Forge LangChain Error", error);
                throw error;
            }
        },
        async generateBlueprint(config) {
            const width = config.width || 32;
            const height = config.height || 32;
            const modelId = config.model || 'gemini-3-pro-preview';
            const contextBuilder = new context_builder_1.ContextBuilder(strapi);
            const cleanPrompt = config.prompt
                .replace(/Humanoid_/gi, '')
                .replace(/\[Creature\] - /gi, '')
                .replace(/_/g, ' ')
                .trim();
            // Legacy Zone Logic - Refactored to match previous implementation
            // We still need local knowledge of zones for symbol mapping *outside* of the prompt context in this specific function,
            // because we need to map the output characters back to zones.
            // However, we will use ContextBuilder for the *prompt context* string if applicable.
            // Actually, Blueprint architecture seems to have its own complex 'zoneInstruction' logic that maps symbols.
            // Let's preserve the logic but move string building to a helper or keep if specific.
            // For now, I will keep the explicit logic here to minimize regression risk on Blueprint specifics,
            // BUT I will use contextBuilder for the entity context.
            const contextData = config.entityData ? `CONTEXT: ${JSON.stringify(config.entityData)}` : "";
            try {
                const model = await this.getModel(modelId);
                const uid = getConfig('zone');
                const zones = await strapi.db.query(uid).findMany();
                let zoneInstruction = "STRICT LEGEND (Symbol -> Meaning):\n- . : Empty Space\n";
                const allowedChars = ['.'];
                const charToZone = { '.': 'none' };
                const zoneToColor = { 'none': 'transparent' };
                const fallbackMap = { 'core': '#', 'head': 'O', 'weapon': 'X', 'hand_l': 'l', 'hand_r': 'r', 'legs': 'L', 'accessory': '+' };
                if (zones) {
                    zones.forEach((z) => {
                        const symbol = z.symbol || fallbackMap[z.slug] || z.slug[0].toUpperCase();
                        if (!allowedChars.includes(symbol)) {
                            allowedChars.push(symbol);
                            zoneInstruction += `- ${symbol} : ${z.name}\n`;
                            charToZone[symbol] = z.slug;
                            zoneToColor[z.slug] = z.color;
                        }
                    });
                }
                // Strict Validation via PromptSchemas
                const formattedPrompt = await this.formatPrompt('blueprint-architect', {
                    prompt: cleanPrompt,
                    archetype: config.archetype || 'entity',
                    width,
                    height,
                    contextData: `${contextData}\n\n${zoneInstruction}\nCRITICAL: You must ONLY use the symbols listed in the Legend above.`
                });
                const BlueprintSchema = zod_1.z.object({
                    blueprint: zod_1.z.array(zod_1.z.string()).describe(`Array of ${height} strings. Each string must be exactly ${width} characters long. ALLOWED CHARACTERS: [${allowedChars.join(', ')}]`)
                });
                const modelWithStructure = model.withStructuredOutput(BlueprintSchema);
                const response = await modelWithStructure.invoke(formattedPrompt);
                const rows = response.blueprint;
                const grid = rows.map(r => r.split(''));
                const validatedGrid = this.validateAndRepairGrid(grid, width, height);
                const uniqueZones = new Set();
                const visualGrid = validatedGrid.map(row => row.map(char => {
                    let slug = charToZone[char];
                    let color = 'transparent';
                    if (slug) {
                        color = zoneToColor[slug] || 'transparent';
                    }
                    else {
                        const z = zones.find((z) => z.symbol === char);
                        if (z) {
                            slug = z.slug;
                            color = z.color;
                        }
                    }
                    if (slug && slug !== 'none') {
                        uniqueZones.add(slug);
                    }
                    return color;
                }));
                return {
                    pixelData: visualGrid,
                    blueprint: validatedGrid,
                    zones: Array.from(uniqueZones)
                };
            }
            catch (e) {
                strapi.log.error("Blueprint Gen Error", e);
                throw e;
            }
        },
        async generateVoxelStructure(config) {
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
                const VoxelSchema = zod_1.z.object({
                    voxelData: zod_1.z.array(zod_1.z.object({
                        x: zod_1.z.number().int().min(0).max(width - 1),
                        y: zod_1.z.number().int().min(0).max(height - 1),
                        z: zod_1.z.number().int().min(0).max(depth - 1),
                        block: zod_1.z.string()
                    }))
                });
                const modelWithStructure = model.withStructuredOutput(VoxelSchema);
                const response = await modelWithStructure.invoke(formattedPrompt);
                return { voxelData: response.voxelData };
            }
            catch (e) {
                strapi.log.error("Voxel Gen Error", e);
                throw e;
            }
        },
        async generateStructuredData(config) {
            const modelId = config.modelId || 'gemini-3-pro-preview';
            try {
                const model = await this.getModel(modelId);
                const formattedPrompt = await this.formatPrompt(config.promptKey, config.variables);
                const modelWithStructure = model.withStructuredOutput(config.schema);
                // We wrap in a System/Human pattern or just prompt depending on complexity. 
                // FormatPrompt usually returns the full text.
                const response = await modelWithStructure.invoke(formattedPrompt);
                return response;
            }
            catch (e) {
                strapi.log.error(`Structured Gen Error (${config.promptKey})`, e);
                throw e;
            }
        },
        validateAndRepairGrid(data, width = 32, height = 32) {
            if (!Array.isArray(data))
                return Array(height).fill(Array(width).fill('transparent'));
            let grid = data;
            if (grid.length > height)
                grid = grid.slice(0, height);
            while (grid.length < height)
                grid.push(Array(width).fill('transparent'));
            grid = grid.map((row) => {
                if (!Array.isArray(row))
                    return Array(width).fill('transparent');
                let newRow = [...row];
                if (newRow.length > width)
                    newRow = newRow.slice(0, width);
                while (newRow.length < width)
                    newRow.push('transparent');
                return newRow.map((cell) => (typeof cell === 'string' ? cell : 'transparent'));
            });
            return grid;
        },
        postProcessPixelData(generated) {
            return generated.map(row => row.map(color => color || 'transparent'));
        },
        blueprintToPixels(blueprint, customMap) {
            if (!blueprint)
                return [];
            const ZONE_COLORS = {
                'core': '#FFFFFF',
                'head': '#FFFF00',
                'weapon': '#FF0000',
                'legs': '#0000FF',
                'hand_l': '#00FF00',
                'hand_r': '#00FF00',
                'accessory': '#FF00FF',
                'none': 'transparent',
                '.': 'transparent',
                '#': '#FFFFFF',
                ...(customMap || {})
            };
            return blueprint.map(row => row.map(cell => {
                const key = cell.toLowerCase();
                return ZONE_COLORS[key] || ZONE_COLORS[cell] || 'transparent';
            }));
        },
        pixelsToPng(grid, scale = 1) {
            var _a, _b;
            const originalWidth = ((_a = grid[0]) === null || _a === void 0 ? void 0 : _a.length) || 32;
            const originalHeight = grid.length || 32;
            const width = originalWidth * scale;
            const height = originalHeight * scale;
            const png = new pngjs_1.PNG({ width, height });
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const sourceX = Math.floor(x / scale);
                    const sourceY = Math.floor(y / scale);
                    const color = ((_b = grid[sourceY]) === null || _b === void 0 ? void 0 : _b[sourceX]) || 'transparent';
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
            return pngjs_1.PNG.sync.write(png);
        },
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
    };
};
