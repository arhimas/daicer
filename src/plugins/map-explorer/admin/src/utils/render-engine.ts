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
  default: '#9e9e9e',
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
    pan: { x: number; y: number },
    terrains: TerrainType[],
    options: {
      showGrid?: boolean;
      ghostLowerLayers?: boolean;
      preview?: { points: { x: number; y: number }[]; color: string };
      preventClear?: boolean;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entities?: any[]; // Layer 1 (Multi-cell)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items?: any[];    // Layer 2 (Stacked)
    } = {}
  ) {
    const { showGrid = true, ghostLowerLayers = true, preview, preventClear = false, entities = [], items = [] } = options;

    if (!preventClear) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    ctx.imageSmoothingEnabled = false;

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
      for (let i = 0; i <= gridSize; i++) {
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, fullSize);
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(fullSize, i * TILE_SIZE);
      }
      ctx.stroke();
    }

    // LAYER 0: TERRAINS
    // We treat the active Z-level tiles as the base Terrain layer.
    if (ghostLowerLayers) {
      for (let z = 0; z < currentZ; z++) {
        if (!chunk.tiles[z]) continue;
        this.renderLayer(ctx, chunk.tiles[z], terrains, 0.3);
      }
    }

    if (chunk.tiles[currentZ]) {
      this.renderLayer(ctx, chunk.tiles[currentZ], terrains, 1.0, true);
    }

    // LAYER 1: ENTITIES
    // Render from their origin (x,y) expanding right/down based on width/height.
    entities.forEach((entity) => {
      if (entity.position && entity.position.z === currentZ) {
        this.renderSpriteData(ctx, entity, 1.0);
      }
    });

    // LAYER 2: ITEMS 
    // Top layer representing dropped items. Currently stacked over exact cell coordinates.
    // To support up to 5 items, we can draw them slightly offset visually or just layered perfectly on top.
    const cellStacks: Record<string, number> = {};
    items.forEach((item) => {
      if (item.position && item.position.z === currentZ) {
        const key = `${item.position.x},${item.position.y}`;
        cellStacks[key] = (cellStacks[key] || 0) + 1;
        
        // Draw up to 5 overlapping item sprites.
        if (cellStacks[key] <= 5) {
           // We try to pass down the entity at this location for anchor tracking
           const boundingEntity = entities.find(e => e.position && e.position.x === item.position.x && e.position.y === item.position.y);
           this.renderSpriteData(ctx, item, 1.0, cellStacks[key] - 1, boundingEntity);
        }
      }
    });

    // 4. Render Preview
    if (preview && preview.points.length > 0) {
      ctx.fillStyle = preview.color;
      ctx.globalAlpha = 0.5;
      preview.points.forEach((p) => {
        if (p.x >= 0 && p.x < 16 && p.y >= 0 && p.y < 16) {
          ctx.fillRect(p.x * TILE_SIZE, p.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      });
      ctx.globalAlpha = 1.0;
    }
  }

  /**
   * Helper method to render 1D or 2D sprite data objects starting from an origin coordinate.
   * Now includes Socket (Anchor) offset arithmetic.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static renderSpriteData(ctx: CanvasRenderingContext2D, objectData: any, alpha: number, stackDepth: number = 0, boundingEntity?: any) {
    const pixels = objectData.spriteData || objectData.pixels;
    if (!pixels || !Array.isArray(pixels) || pixels.length === 0) return;

    ctx.globalAlpha = alpha;
    
    // We must respect the scale dimensions of the entity. E.g a large entity takes 2x2 cells.
    // If not provided, we assume 1x1.
    const cellsW = objectData.width || 1;
    const cellsH = objectData.height || 1;
    let targetWidth = TILE_SIZE * cellsW;
    let targetHeight = TILE_SIZE * cellsH;
    
    // Socket/Anchor Offset Math
    let socketOffsetX = 0;
    let socketOffsetY = 0;

    if (boundingEntity && boundingEntity.metadata?.sockets && objectData.metadata?.sockets) {
       // Item has sockets ("handle", "head") and Entity has sockets. Try to match.
       // Default item socket might be the first one listed
       const itemOrigin = objectData.metadata.sockets[0];
       if (itemOrigin) {
          const matchingEntitySocket = boundingEntity.metadata.sockets.find((s: { label: string; x: number; y: number }) => s.label === itemOrigin.label);
          if (matchingEntitySocket) {
             // The entity's socket coordinates (in pixel space relative to its texture)
             // need to map to the item's socket coordinates.
             // (Assuming 32x32 native textures scaled to TILE_SIZE)
             const scaleX = (boundingEntity.width || 1) * TILE_SIZE / 32;
             const scaleY = (boundingEntity.height || 1) * TILE_SIZE / 32;
             
             socketOffsetX = (matchingEntitySocket.x * scaleX) - (itemOrigin.x * (targetWidth / 32));
             socketOffsetY = (matchingEntitySocket.y * scaleY) - (itemOrigin.y * (targetHeight / 32));
             
             // If anchored, ignore standard cell-spreading for items (keep it bounded to socket scale)
             targetWidth = targetWidth / Math.max(1, cellsW);
             targetHeight = targetHeight / Math.max(1, cellsH);
          }
       }
    }

    // Visual stacking offset (Move items slightly down-right based on stack depth)
    const baseOffsetX = objectData.position.x * TILE_SIZE + (stackDepth * 2);
    const baseOffsetY = objectData.position.y * TILE_SIZE + (stackDepth * 2);
    
    const offsetX = baseOffsetX + socketOffsetX;
    const offsetY = baseOffsetY + socketOffsetY;

    if (typeof pixels[0] === 'string') {
      // 1D Array (Hex)
      const dim = Math.sqrt(pixels.length);
      if (Number.isInteger(dim)) {
        const scaleX = targetWidth / dim;
        const scaleY = targetHeight / dim;
        pixels.forEach((colPx: string, index: number) => {
          if (colPx && colPx !== 'transparent' && colPx !== '#00000000') {
             const px = index % dim;
             const py = Math.floor(index / dim);
             ctx.fillStyle = colPx;
             ctx.fillRect(offsetX + (px * scaleX), offsetY + (py * scaleY), scaleX, scaleY);
          }
        });
      }
    } else if (Array.isArray(pixels[0])) {
      // 2D Matrix (Legacy)
      const dimY = pixels.length;
      pixels.forEach((rowPx: string[], py: number) => {
        const dimX = rowPx.length;
        const scaleX = targetWidth / dimX;
        const scaleY = targetHeight / dimY;
        rowPx.forEach((colPx: string, px: number) => {
          if (colPx && colPx !== 'transparent' && colPx !== '#00000000') {
             ctx.fillStyle = colPx;
             ctx.fillRect(offsetX + (px * scaleX), offsetY + (py * scaleY), scaleX, scaleY);
          }
        });
      });
    }
    
    ctx.globalAlpha = 1.0;
  }

  private static renderLayer(
    ctx: CanvasRenderingContext2D,
    layer: (Tile | null)[][],
    terrains: TerrainType[],
    alpha: number,
    outline: boolean = false
  ) {
    layer.forEach((row) => {
      if (!row) return;
      row.forEach((tile) => {
        if (!tile || tile.block === 'air') return;

        // Lookup Terrain
        // Match by slug or name
        // Lookup Terrain
        // Match by slug, name, or ID (robustness)
        const terrain = terrains.find(
          (t) =>
            t.slug === tile.block ||
            t.name === tile.block ||
            t.documentId === tile.block ||
            (t.id && String(t.id) === String(tile.block))
        );

        // Priority:
        // 1. Tile specific pixels (Custom override)
        // 2. Terrain texture pixels (Shared asset)
        // 3. Sensible Color Fallback

        let pixels: unknown =
          tile.pixels && tile.pixels.length > 0 ? tile.pixels : terrain?.texture || terrain?.pixels;

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
          // Case 1: Matrix (Legacy string[][])
          if (pixels.length > 0 && Array.isArray(pixels[0])) {
            const dimY = pixels.length;
            pixels.forEach((rowPx: string[], py: number) => {
              const dimX = rowPx.length;
              rowPx.forEach((colPx: string, px: number) => {
                if (colPx && colPx !== 'transparent' && colPx !== '#00000000') {
                  const scaleX = TILE_SIZE / dimX;
                  const scaleY = TILE_SIZE / dimY;
                  ctx.fillStyle = colPx;
                  ctx.fillRect(tile.x * TILE_SIZE + (px * scaleX), tile.y * TILE_SIZE + (py * scaleY), scaleX, scaleY);
                }
              });
            });
          }
          // Case 2: Flat Hex Array (1D string[] from PNG)
          else if (pixels.length > 0 && typeof pixels[0] === 'string') {
            const dim = Math.sqrt(pixels.length);
            if (Number.isInteger(dim)) {
              const scale = TILE_SIZE / dim;
              (pixels as string[]).forEach((colPx: string, index: number) => {
                if (colPx && colPx !== 'transparent' && colPx !== '#00000000') {
                  const px = index % dim;
                  const py = Math.floor(index / dim);
                  ctx.fillStyle = colPx;
                  ctx.fillRect(tile.x * TILE_SIZE + (px * scale), tile.y * TILE_SIZE + (py * scale), scale, scale);
                }
              });
            }
          }
          // Case 2: Flattened Voxel List (from TextureInput)
          else if (pixels.length > 0 && typeof pixels[0] === 'object') {
            (
              pixels as Array<{ x: number; y: number; z?: number; block?: string; type?: string }>
            ).forEach((p) => {
              const color = p.block || p.type;
              if (p && color && color !== 'air') {
                // p is {x, y, z, block|type} relative to 32x32 grid
                // Check transparency/validity
                if (color !== 'transparent') {
                  ctx.fillStyle = color;
                  ctx.fillRect(tile.x * TILE_SIZE + p.x, tile.y * TILE_SIZE + p.y, 1, 1);
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
          if (
            tile.block.includes('water') ||
            tile.block.includes('glass') ||
            terrain?.isTransparent
          ) {
            tileAlpha = alpha * 0.6;
          }
          ctx.globalAlpha = tileAlpha;

          if (!color) {
            // Debug Pink
            console.warn('[RenderEngine] Pink Fallback Hit!', {
              block: tile.block,
              terrain: terrain?.slug,
            });
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

    const terrain = terrains.find((t) => t.slug === slug || t.name === slug);
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
