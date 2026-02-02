"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PixelForgeService = void 0;
const compositor_1 = require("../../utils/compositor");
const pixel_math_1 = require("../../utils/pixel-math");
const grid_utils_1 = require("./grid-utils");
const creature_1 = require("./generators/creature");
const item_1 = require("./generators/item");
const PixelForgeService = ({ strapi }) => {
    const getConfig = (key) => strapi.plugin('map-explorer').config('contentTypes')[key];
    return {
        /**
         * Generates a Pixel Art Grid for a given Entity.
         * Fetches deep relations: Race, Appearance, Equipment.
         * Scaling Logic Applied.
         * Smart Compositor Applied.
         */
        async generateEntity(entityId) {
            var _a, _b, _c, _d, _e;
            const uid = getConfig('entity');
            const entity = await strapi.db.query(uid).findOne({
                where: { documentId: entityId },
                populate: ['race', 'appearance', 'equipment', 'inventory']
            });
            if (!entity) {
                throw new Error(`Entity not found: ${entityId}`);
            }
            const config = {
                race: ((_a = entity.race) === null || _a === void 0 ? void 0 : _a.slug) || 'human',
                gender: 'male',
                skinTone: ((_b = entity.appearance) === null || _b === void 0 ? void 0 : _b.skin) || '#dcb097',
                size: entity.size || 'Medium'
            };
            // 1. Generate Base Body
            const layers = (0, creature_1.generateCreatureLayers)(config);
            const baseGrid = (0, creature_1.composeLayers)(layers);
            // 2. Synthesize Blueprint
            const baseBlueprint = (0, creature_1.synthesizeBlueprint)(config);
            const baseAsset = {
                pixelData: baseGrid,
                blueprint: baseBlueprint,
                archetype: 'Humanoid'
            };
            // 3. Process Equipment
            const equipmentAssets = [];
            if (entity.equipment && entity.equipment.length > 0) {
                for (const item of entity.equipment) {
                    // Reuse public generateItem logic but we need implementation here?
                    // Or calling this.generateItem? 
                    // We can call the exposed method if we bind `this`, but safe to just rely on internal helpers.
                    // Actually, generateItem just calls generateItemGrid after fetch.
                    // We can duplicate the fetch logic or refactor.
                    // Let's duplicate the fetch for now to keep it simple, or use strapi query directly.
                    const itemUid = getConfig('item');
                    const itemData = await strapi.db.query(itemUid).findOne({
                        where: { documentId: item.documentId },
                        populate: ['equipment_data']
                    });
                    if (itemData) {
                        const itemConfig = {
                            itemType: itemData.type,
                            subType: ((_e = (_d = (_c = itemData.equipment_data) === null || _c === void 0 ? void 0 : _c.properties) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.slug) || 'generic',
                            size: itemData.size || 'Medium'
                        };
                        const itemGrid = (0, item_1.generateItemGrid)(itemConfig);
                        // Cast to string[][] because grid-utils returns (string|null)[][]
                        const itemGridStr = itemGrid;
                        const itemBlueprint = (0, item_1.synthesizeItemBlueprint)(itemGridStr, itemData.type);
                        equipmentAssets.push({
                            pixelData: itemGridStr,
                            blueprint: itemBlueprint,
                            archetype: itemData.type === 'weapon' ? 'Sword' : 'Accessory'
                        });
                    }
                }
            }
            // 4. Smart Composite
            if (equipmentAssets.length > 0) {
                const result = (0, compositor_1.compositeLoadout)(baseAsset, equipmentAssets);
                return result.grid;
            }
            return baseGrid;
        },
        /**
         * Generates a Pixel Art Grid for a given Item.
         */
        async generateItem(itemId) {
            var _a, _b, _c;
            const uid = getConfig('item');
            const item = await strapi.db.query(uid).findOne({
                where: { documentId: itemId },
                populate: ['equipment_data']
            });
            if (!item) {
                throw new Error(`Item not found: ${itemId}`);
            }
            const config = {
                itemType: item.type,
                subType: ((_c = (_b = (_a = item.equipment_data) === null || _a === void 0 ? void 0 : _a.properties) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.slug) || 'generic',
                size: item.size || 'Medium'
            };
            return (0, item_1.generateItemGrid)(config);
        },
        // Legacy/Exposed Methods
        generateCreature(config) {
            return (0, creature_1.generateCreatureLayers)(config);
        },
        generateCreatureLayers: creature_1.generateCreatureLayers,
        generatePart: creature_1.generatePart,
        compose: creature_1.composeLayers,
        createEmptyGrid: grid_utils_1.createEmptyGrid,
        fillBox: grid_utils_1.fillBox,
        markBox: grid_utils_1.markBox,
        generateItemGrid: item_1.generateItemGrid,
        parseColor: pixel_math_1.parseColor,
        hexToRgba(hex, alpha) {
            const c = (0, pixel_math_1.parseColor)(hex);
            c.a = Math.floor(alpha * 255);
            return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
        }
    };
};
exports.PixelForgeService = PixelForgeService;
exports.default = exports.PixelForgeService;
