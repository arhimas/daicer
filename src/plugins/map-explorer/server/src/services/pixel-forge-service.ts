import type { Core } from '@strapi/strapi';

// Types
export type BodyPartType = 'head' | 'torso' | 'arm_left' | 'arm_right' | 'leg_left' | 'leg_right';
export type CreatureSize = 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';
export type AssetType = 'Monster' | 'Item' | 'Race' | 'Environment' | 'Terrain';
export type Archetype = 
  | 'Humanoid' | 'Quadruped' | 'Winged' | 'Ethereal' 
  | 'Sword' | 'Polearm' | 'Shield' | 'Headwear' | 'Body Armor' | 'Legwear' | 'Handwear' | 'Footwear' | 'Accessory';

export interface GenerationConfig {
    race?: string; // slug or name
    gender?: 'male' | 'female';
    skinTone?: string; // Hex
    itemType?: string;
    subType?: string;
    size?: CreatureSize;
}

export interface PixelLayer {
    name: string;
    pixels: (string | null)[][]; // 32x32 grid of Hex or rgba colors
    zIndex: number;
    opacity?: number;
}

const GRID_SIZE = 32;
const CENTER = 16;

export const PixelForgeService = ({ strapi }: { strapi: Core.Strapi }) => ({

// ... imports
import { compositeLoadout, AssetStub, ZoneType } from '../utils/compositor';

// ... (previous code)

    /**
     * Generates a Pixel Art Grid for a given Entity.
     * Fetches deep relations: Race, Appearance, Equipment.
     * Scaling Logic Applied.
     * Smart Compositor Applied.
     */
    async generateEntity(entityId: string): Promise<string[][]> {
        const entity = await strapi.db.query('api::entity.entity').findOne({
            where: { documentId: entityId },
            populate: ['race', 'appearance', 'equipment', 'inventory']
        });

        if (!entity) {
            throw new Error(`Entity not found: ${entityId}`);
        }

        const config: GenerationConfig = {
            race: entity.race?.slug || 'human',
            gender: 'male', 
            skinTone: entity.appearance?.skin || '#dcb097',
            size: entity.size || 'Medium'
        };

        // 1. Generate Base Body
        const layers = this.generateCreatureLayers(config);
        const baseGrid = this.compose(layers); // Flatten base layers
        
        // 2. Synthesize Blueprint (Metadata) for Base Body
        // Since we are procedural, we don't have a real blueprint from AI.
        // We can approximate it based on our procedural generation logic.
        const baseBlueprint = this.synthesizeBlueprint(config);

        const baseAsset: AssetStub = {
            pixelData: baseGrid,
            blueprint: baseBlueprint,
            archetype: 'Humanoid' // Assumption
        };

        // 3. Process Equipment
        const equipmentAssets: AssetStub[] = [];
        if (entity.equipment && entity.equipment.length > 0) {
            for (const item of entity.equipment) {
                 const itemGrid = await this.generateItem(item.documentId);
                 // Synthesize Item Blueprint?
                 // For now, procedural items are simple.
                 // We can create a basic blueprint where non-transparent = 'core' or 'weapon'
                 const itemBlueprint = this.synthesizeItemBlueprint(itemGrid, item.type);
                 
                 equipmentAssets.push({
                     pixelData: itemGrid,
                     blueprint: itemBlueprint,
                     archetype: item.type === 'weapon' ? 'Sword' : 'Accessory' // Simple mapping, could improve
                 });
            }
        }

        // 4. Smart Composite
        if (equipmentAssets.length > 0) {
            const result = compositeLoadout(baseAsset, equipmentAssets);
            return result.grid;
        }

        return baseGrid;
    },

    // ... (generateItem, generateCreatureLayers...)

    // --- BLUEPRINT SYNTHESIS (Helper for Procedural -> Smart Compositor) ---
    
    synthesizeBlueprint(config: GenerationConfig): ZoneType[][] {
        const grid = this.createEmptyGrid();
        const size = config.size || 'Medium';
         
        // Re-run the bounds logic to know where we drew things
        const b = this.getBounds(size);
        const { min, size: s } = b;
        const px = (p: number) => Math.floor(min + (s * p));
        const py = (p: number) => Math.floor(min + (s * p));
        const sw = (p: number) => Math.max(1, Math.floor(s * p));
        const sh = (p: number) => Math.max(1, Math.floor(s * p));
        
        // Mark zones roughly where we drew parts
        // Head
        this.markBox(grid, px(0.35), py(0.05), sw(0.3), sh(0.2), 'head');
        // Torso
        this.markBox(grid, px(0.25), py(0.25), sw(0.5), sh(0.4), 'core');
        // Hands
        this.markBox(grid, px(0.1), py(0.25), sw(0.15), sh(0.35), 'hand_l');
        this.markBox(grid, px(0.75), py(0.25), sw(0.15), sh(0.35), 'hand_r');
        // Legs
        this.markBox(grid, px(0.3), py(0.65), sw(0.15), sh(0.35), 'legs');
        this.markBox(grid, px(0.55), py(0.65), sw(0.15), sh(0.35), 'legs');

        return grid as ZoneType[][];
    },

    synthesizeItemBlueprint(pixels: string[][], type: string): ZoneType[][] {
        const grid = this.createEmptyGrid() as unknown as ZoneType[][];
        // Simple heuristic: If pixel exists, mark as type
        const zone = type === 'weapon' ? 'weapon' : 'accessory';
        
        for(let y=0; y<GRID_SIZE; y++) {
            for(let x=0; x<GRID_SIZE; x++) {
                if(pixels[y][x] && pixels[y][x] !== 'transparent') {
                    grid[y][x] = zone;
                } else {
                    grid[y][x] = 'none';
                }
            }
        }
        return grid;
    },

    markBox(grid: (string | null)[][], x: number, y: number, w: number, h: number, type: string) {
        for (let iy = y; iy < y + h; iy++) {
            for (let ix = x; ix < x + w; ix++) {
                if (iy >= 0 && iy < GRID_SIZE && ix >= 0 && ix < GRID_SIZE) {
                     // @ts-ignore
                    grid[iy][ix] = type;
                }
            }
        }
    },

    // ... (rest of the file: compose, createEmptyGrid, fillBox, hexToRgba, parseColor)


    /**
     * Generates a Pixel Art Grid for a given Item.
     * Uses equipment data to determine shape.
     */
    async generateItem(itemId: string): Promise<string[][]> {
        const item = await strapi.db.query('api::item.item').findOne({
            where: { documentId: itemId },
            populate: ['equipment_data']
        });

        if (!item) {
            throw new Error(`Item not found: ${itemId}`);
        }

        const config: GenerationConfig = {
            itemType: item.type,
            subType: item.equipment_data?.properties?.[0]?.slug || 'generic',
            size: item.size || 'Medium'
        };

        return this.generateItemGrid(config);
    },

    /**
     * Legacy internal method for Map Explorer Sprite Generation (Runtime)
     */
    generateCreature(config: GenerationConfig): PixelLayer[] {
        return this.generateCreatureLayers(config);
    },

    // --- SCALING LOGIC (Ported from pixeforgeai) ---

    getRadius(s: CreatureSize): number {
        switch(s) {
            case 'Fine': return 3;       // 6x6 box relative to 32px grid
            case 'Diminutive': return 5; // 10x10 box
            case 'Tiny': return 8;       // 16x16 box
            case 'Small': return 12;     // 24x24 box
            case 'Medium': return 15;    // 30x30 box (Standard)
            default: return 16;          // 32x32 box (Full)
        }
    },

    getBounds(s: CreatureSize) {
        const r = this.getRadius(s);
        return {
            min: CENTER - r,
            max: CENTER + r,
            size: r * 2
        };
    },

    // --- GENERATORS ---

    generateCreatureLayers(config: GenerationConfig): PixelLayer[] {
        const layers: PixelLayer[] = [];

        // 1. Generate Anatomy Parts
        const torso = this.generatePart('torso', config);
        const head = this.generatePart('head', config);
        const lArm = this.generatePart('arm_left', config);
        const rArm = this.generatePart('arm_right', config);
        const lLeg = this.generatePart('leg_left', config);
        const rLeg = this.generatePart('leg_right', config);

        // 2. Add to Layers (Z-Ordered)
        layers.push({ name: 'leg_left', pixels: lLeg, zIndex: 0 });
        layers.push({ name: 'leg_right', pixels: rLeg, zIndex: 0 });
        layers.push({ name: 'torso', pixels: torso, zIndex: 1 });
        layers.push({ name: 'head', pixels: head, zIndex: 2 });
        layers.push({ name: 'arm_left', pixels: lArm, zIndex: 3 });
        layers.push({ name: 'arm_right', pixels: rArm, zIndex: 3 });

        return layers;
    },

    generateItemGrid(config: GenerationConfig): (string | null)[][] {
        const grid = this.createEmptyGrid();
        const color = '#c0c0c0'; // Silver default
        const size = config.size || 'Medium';
        
        // Bounds
        const b = this.getBounds(size);
        const { min, size: s } = b;

        // Helpers
        const px = (p: number) => Math.floor(min + (s * p));
        const py = (p: number) => Math.floor(min + (s * p));
        const sw = (p: number) => Math.max(1, Math.floor(s * p));
        const sh = (p: number) => Math.max(1, Math.floor(s * p));

        // Basic Item Shapes (Expanded logic could go here)
        if (config.itemType === 'weapon') {
             // Simple Sword Shape
             this.fillBox(grid, px(0.42), py(0.05), sw(0.16), sh(0.55), color); // Blade
             this.fillBox(grid, px(0.25), py(0.55), sw(0.5), sh(0.1), '#8b4513'); // Guard
             this.fillBox(grid, px(0.45), py(0.6), sw(0.1), sh(0.25), '#8b4513'); // Handle
        } else if (config.itemType === 'armor') {
             // Chestplate
             this.fillBox(grid, px(0.2), py(0.15), sw(0.6), sh(0.6), color);
        } else {
             // Generic Loot Box
             this.fillBox(grid, px(0.25), px(0.25), sw(0.5), sh(0.5), '#ffd700');
        }

        return grid;
    },

    generatePart(type: BodyPartType, config: GenerationConfig): (string | null)[][] {
        const grid = this.createEmptyGrid();
        const color = config.skinTone || '#dcb097'; 
        const size = config.size || 'Medium';

        // Scale Logic
        const b = this.getBounds(size);
        const { min, size: s } = b;

        const px = (p: number) => Math.floor(min + (s * p));
        const py = (p: number) => Math.floor(min + (s * p));
        const sw = (p: number) => Math.max(1, Math.floor(s * p));
        const sh = (p: number) => Math.max(1, Math.floor(s * p));

        const isSmall = ['halfling', 'gnome', 'goblin'].includes(config.race || '') || ['Tiny', 'Small', 'Fine', 'Diminutive'].includes(size);
        const isLarge = ['orc', 'dragonborn'].includes(config.race || '') || ['Large', 'Huge', 'Gargantuan', 'Colossal'].includes(size);
        
        let wModPct = 0;
        if (isSmall) wModPct = -0.05;
        if (isLarge) wModPct = 0.05;

        switch (type) {
            case 'head':
                this.fillBox(grid, px(0.35 - wModPct), py(0.05), sw(0.3 + (wModPct*2)), sh(0.2), color);
                break;
            case 'torso':
                this.fillBox(grid, px(0.25 - wModPct), py(0.25), sw(0.5 + (wModPct*2)), sh(0.4), color);
                break;
            case 'arm_left':
                this.fillBox(grid, px(0.1), py(0.25), sw(0.15), sh(0.35), color);
                break;
            case 'arm_right':
                this.fillBox(grid, px(0.75), py(0.25), sw(0.15), sh(0.35), color);
                break;
            case 'leg_left':
                this.fillBox(grid, px(0.3), py(0.65), sw(0.15), sh(0.35), color);
                break;
            case 'leg_right':
                this.fillBox(grid, px(0.55), py(0.65), sw(0.15), sh(0.35), color);
                break;
        }

        return grid;
    },

    compose(layers: PixelLayer[]): (string | null)[][] {
        const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
        const finalGrid = this.createEmptyGrid();

        for (const layer of sorted) {
            const opacity = layer.opacity ?? 1.0;
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    const srcPixel = layer.pixels[y][x];
                    if (srcPixel && srcPixel !== 'transparent') {
                        // Simple overwrite for MVP
                        finalGrid[y][x] = srcPixel;
                    }
                }
            }
        }
        return finalGrid;
    },

    createEmptyGrid() {
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    },

    fillBox(grid: (string | null)[][], x: number, y: number, w: number, h: number, color: string) {
        for (let iy = y; iy < y + h; iy++) {
            for (let ix = x; ix < x + w; ix++) {
                if (iy >= 0 && iy < GRID_SIZE && ix >= 0 && ix < GRID_SIZE) {
                    grid[iy][ix] = color;
                }
            }
        }
    },

    hexToRgba(hex: string, alpha: number) {
        if (!hex.startsWith('#')) return hex;
        // Simple shim, ideally use proper parsing if needed later
        return hex; 
    }
});

export default PixelForgeService;
