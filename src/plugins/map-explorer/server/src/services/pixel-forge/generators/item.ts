import { getPixelDimensions } from '../../../utils/entity-geometry';
import { createEmptyGrid, fillBox, markBox } from '../grid-utils';
import { GenerationConfig } from '../types';
import { ZoneType } from '../../../utils/compositor';

export const generateItemGrid = (config: GenerationConfig): (string | null)[][] => {
  const size = config.size || 'Medium';
  const gridSize = getPixelDimensions(size);
  const grid = createEmptyGrid(gridSize);
  const color = '#c0c0c0'; // Silver default

  // Full Frame Drawing (0.0 - 1.0 is full grid)
  const px = (p: number) => Math.floor(gridSize * p);
  const py = (p: number) => Math.floor(gridSize * p);
  const sw = (p: number) => Math.max(1, Math.floor(gridSize * p));
  const sh = (p: number) => Math.max(1, Math.floor(gridSize * p));

  // Basic Item Shapes
  if (config.itemType === 'weapon') {
    // Simple Sword Shape
    fillBox(grid, px(0.42), py(0.05), sw(0.16), sh(0.55), color); // Blade
    fillBox(grid, px(0.25), py(0.55), sw(0.5), sh(0.1), '#8b4513'); // Guard
    fillBox(grid, px(0.45), py(0.6), sw(0.1), sh(0.25), '#8b4513'); // Handle
  } else if (config.itemType === 'armor') {
    // Chestplate
    fillBox(grid, px(0.2), py(0.15), sw(0.6), sh(0.6), color);
  } else {
    // Generic Loot Box
    fillBox(grid, px(0.25), px(0.25), sw(0.5), sh(0.5), '#ffd700');
  }

  return grid;
};

export const synthesizeItemBlueprint = (pixels: string[][], type: string): ZoneType[][] => {
  const gridSize = pixels.length; // Infer from input
  const grid = createEmptyGrid(gridSize);
  // Simple heuristic: If pixel exists, mark as type
  const zone = type === 'weapon' ? 'weapon' : 'accessory';

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (pixels[y][x] && pixels[y][x] !== 'transparent') {
        markBox(grid, x, y, 1, 1, zone);
      }
    }
  }
  return grid as unknown as ZoneType[][];
};
