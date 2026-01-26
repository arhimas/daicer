
import { Chunk, Tile, TerrainType } from '../types';
import { TILE_SIZE } from '../constants';

// Sensible defaults so we don't rely on a 'color' field
const SENSIBLE_COLORS: Record<string, string> = {
    air: 'transparent',
    stone: '#7d7d7d',
    dirt: '#5d4037',
    grass: '#4caf50',
    water: '#2196f3',
    sand: '#fbc02d',
    snow: '#ffffff',
    wood: '#795548',
    leaf: '#388e3c',
    glass: '#aed581', // semi-transparent handled in logic
    lava: '#f44336',
    bedrock: '#212121',
    // Fallback
    default: '#9e9e9e'
};

/**
 * Canvas Rendering Engine for Voxel Maps.
 *
 * Handles multi-layer tile rendering, sub-pixel textures, and ghosting layers.
 */
export class RenderEngine {
    /**
     * Renders a complete view of a chunk onto a canvas context.
     *
     * @param ctx - Canvas Rendering Context (2D).
     * @param chunk - The voxel data chunk to render.
     * @param currentZ - The specific Z-level (height) to render as the active layer.
     * @param scale - Zoom scale factor (default 1.0).
     * @param pan - Panning offset (x, y).
     * @param terrains - Registry of available terrain types for texture/color lookup.
     * @param options - Configuration options (grid, ghosting, preview).
     */
    static render(
        ctx: CanvasRenderingContext2D,
        chunk: Chunk,
        currentZ: number,
        scale: number,
        pan: { x: number, y: number },
        terrains: TerrainType[], 
        options: { 
            showGrid?: boolean; 
            ghostLowerLayers?: boolean; 
            preview?: { points: {x:number, y:number}[], color: string };
            preventClear?: boolean; // New option for multi-chunk composition
        } = {}
    ) {
        const { showGrid = true, ghostLowerLayers = true, preview, preventClear = false } = options;

        if (!preventClear) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Nearest Neighbor for crispy pixels
        ctx.imageSmoothingEnabled = false;

        // If we simply translate/scale here, it stacks with existing transform if preventClear is true?
        // Yes, standard canvas behavior.
        // However, we need to be careful. Typically RenderEngine assumes it owns the context state.
        // Users using preventClear must handle their own context isolation (save/restore) OUTSIDE this call.
        
        ctx.translate(pan.x, pan.y);
        ctx.scale(scale, scale);

        // 1. Draw Grid
        if (showGrid) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1 / scale; 
            ctx.beginPath();
            // Assuming 16x16 chunk
            const gridSize = 16;
            const fullSize = gridSize * TILE_SIZE;
            for(let i=0; i<=gridSize; i++) {
                ctx.moveTo(i * TILE_SIZE, 0);
                ctx.lineTo(i * TILE_SIZE, fullSize);
                ctx.moveTo(0, i * TILE_SIZE);
                ctx.lineTo(fullSize, i * TILE_SIZE);
            }
            ctx.stroke();
        }

        // 2. Render Lower Layers (Ghosting)
        if (ghostLowerLayers) {
             for (let z = 0; z < currentZ; z++) {
                if (!chunk.tiles[z]) continue;
                this.renderLayer(ctx, chunk.tiles[z], terrains, 0.3); // Slightly higher visibility
            }
        }

        // 3. Render Current Layer
        if (chunk.tiles[currentZ]) {
            this.renderLayer(ctx, chunk.tiles[currentZ], terrains, 1.0, true);
        }

        // 4. Render Preview
        if (preview && preview.points.length > 0) {
            ctx.fillStyle = preview.color;
            ctx.globalAlpha = 0.5;
            preview.points.forEach(p => {
                 if (p.x >= 0 && p.x < 16 && p.y >= 0 && p.y < 16) {
                     ctx.fillRect(p.x * TILE_SIZE, p.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                 }
            });
            ctx.globalAlpha = 1.0;
        }
    }

    /**
     * Internal method to render a single Z-layer.
     */
    private static renderLayer(
        ctx: CanvasRenderingContext2D, 
        layer: (Tile | null)[][], 
        terrains: TerrainType[], 
        alpha: number, 
        outline: boolean = false
    ) {
        layer.forEach(row => {
            if (!row) return;
            row.forEach(tile => {
                if (!tile || tile.block === 'air') return;
                
                // Lookup Terrain
                // Match by slug or name
                // Lookup Terrain
                // Match by slug, name, or ID (robustness)
                const terrain = terrains.find(t => 
                    t.slug === tile.block || 
                    t.name === tile.block || 
                    t.documentId === tile.block || 
                    (t.id && String(t.id) === String(tile.block))
                );
                
                // Priority:
                // 1. Tile specific pixels (Custom override)
                // 2. Terrain texture pixels (Shared asset)
                // 3. Sensible Color Fallback
                
                let pixels: unknown = tile.pixels && tile.pixels.length > 0 
                    ? tile.pixels 
                    : (terrain?.texture || terrain?.pixels); 
                
                // Parse stringified JSON if needed (Critical for sub-pixel rendering)
                if (typeof pixels === 'string') {
                    try {
                        pixels = JSON.parse(pixels);
                    } catch {
                         // warning suppressed
                    }
                }

                ctx.globalAlpha = alpha;

                if (pixels && Array.isArray(pixels)) {
                     // RENDER TEXTURE
                     // Case 1: Matrix (32x32 string[][])
                     if (pixels.length === 32 && Array.isArray(pixels[0])) {
                         pixels.forEach((rowPx: string[], py: number) => {
                             rowPx.forEach((colPx: string, px: number) => {
                                 if (colPx && colPx !== 'transparent') {
                                     ctx.fillStyle = colPx;
                                     ctx.fillRect(
                                         (tile.x * TILE_SIZE) + px, 
                                         (tile.y * TILE_SIZE) + py, 
                                         1, 1
                                     );
                                 }
                             });
                         });
                     } 
                     // Case 2: Flattened Voxel List (from TextureInput)
                     else if (pixels.length > 0 && typeof pixels[0] === 'object') {
                         (pixels as Array<{x:number; y:number; z?: number; block?:string; type?: string;}>).forEach((p) => {
                             const color = p.block || p.type;
                             if (p && color && color !== 'air') {
                                 // p is {x, y, z, block|type} relative to 32x32 grid
                                 // Check transparency/validity
                                 if (color !== 'transparent') {
                                     ctx.fillStyle = color;
                                      ctx.fillRect(
                                         (tile.x * TILE_SIZE) + p.x, 
                                         (tile.y * TILE_SIZE) + p.y, 
                                         1, 1
                                     );
                                 }
                             }
                         });
                     }
                } else {
                    // FALLBACK: Uniform Color
                    let color = terrain?.color; // If exists (legacy support)
                    
                    if (!color) {
                         const rawBlock = tile.block;
                         // 1. Check if Block IS a Color (Hex/RGB)
                         if (rawBlock && (rawBlock.startsWith('#') || rawBlock.startsWith('rgb'))) {
                             color = rawBlock;
                         } else {
                             // 2. Use Sensible Defaults
                             // Try exact match, or partial match (e.g. 'dark_stone' -> 'stone')
                             const type = rawBlock ? rawBlock.toLowerCase() : 'default';
                             
                             if (SENSIBLE_COLORS[type]) color = SENSIBLE_COLORS[type];
                             else if (type.includes('stone')) color = SENSIBLE_COLORS.stone;
                             else if (type.includes('grass')) color = SENSIBLE_COLORS.grass;
                             else if (type.includes('water')) color = SENSIBLE_COLORS.water;
                             else if (type.includes('wood')) color = SENSIBLE_COLORS.wood;
                             else color = SENSIBLE_COLORS.default;
                         }
                    }

                    // Transparency check
                    let tileAlpha = alpha;
                    if (tile.block.includes('water') || tile.block.includes('glass') || (terrain?.isTransparent)) {
                         tileAlpha = alpha * 0.6;
                    }
                    ctx.globalAlpha = tileAlpha;

                    if (!color) {
                         // Debug Pink
                         console.warn('[RenderEngine] Pink Fallback Hit!', { block: tile.block, terrain: terrain?.slug });
                         color = '#ff00ff';
                    }
                    ctx.fillStyle = color;
                    ctx.fillRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }

                ctx.globalAlpha = 1.0; // Reset

                // Outline
                if (outline) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; // Faint white for crispness on dark textures
                    ctx.lineWidth = 0.5; 
                    ctx.strokeRect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            });
        });
    }

    /**
     * Resolves a color string for a given block type or slug.
     */
    static getBlockColor(slug: string, terrains: TerrainType[]) {
        if (!slug) return SENSIBLE_COLORS.default;
        if (slug.startsWith('#') || slug.startsWith('rgb') || slug === 'transparent') {
            return slug;
        }
        
        const type = slug.toLowerCase();
        if (SENSIBLE_COLORS[type]) return SENSIBLE_COLORS[type];
        
        const terrain = terrains.find(t => t.slug === slug || t.name === slug);
        if (terrain?.color) return terrain.color;

        // Fallbacks
        if (type.includes('stone')) return SENSIBLE_COLORS.stone;
        if (type.includes('grass')) return SENSIBLE_COLORS.grass;
        if (type.includes('water')) return SENSIBLE_COLORS.water;
        if (type.includes('wood')) return SENSIBLE_COLORS.wood;
        if (type.includes('sand')) return SENSIBLE_COLORS.sand;
        if (type.includes('snow')) return SENSIBLE_COLORS.snow;
        
        return SENSIBLE_COLORS.default;
    }
}
