import { createEmptyGrid, fillBox, markBox } from '../grid-utils';
import { EntityContext } from '../serializers';
import { PixelLayer } from '@/plugins/map-explorer/server/src/services/pixel-forge/types';
import { ZoneType } from '@/plugins/map-explorer/server/src/utils/compositor';

type BodyPartType = 'head' | 'torso' | 'arm_left' | 'arm_right' | 'leg_left' | 'leg_right';

export const generatePart = (type: BodyPartType, ctx: EntityContext): (string | null)[][] => {
  const gridSize = ctx.width; // Already computed in Context
  const grid = createEmptyGrid(gridSize);
  const color = ctx.skinTone;

  // Full Frame Drawing
  const px = (p: number) => Math.floor(gridSize * p);
  const py = (p: number) => Math.floor(gridSize * p);
  const sw = (p: number) => Math.max(1, Math.floor(gridSize * p));
  const sh = (p: number) => Math.max(1, Math.floor(gridSize * p));

  const isSmall = ['Tiny', 'Small', 'Fine', 'Diminutive'].includes(ctx.size);
  const isLarge = ['Large', 'Huge', 'Gargantuan', 'Colossal'].includes(ctx.size);

  let wModPct = 0;
  if (isSmall) wModPct = -0.05;
  if (isLarge) wModPct = 0.05;

  switch (type) {
    case 'head':
      fillBox(grid, px(0.35 - wModPct), py(0.05), sw(0.3 + wModPct * 2), sh(0.2), color);
      break;
    case 'torso':
      fillBox(grid, px(0.25 - wModPct), py(0.25), sw(0.5 + wModPct * 2), sh(0.4), color);
      break;
    case 'arm_left':
      fillBox(grid, px(0.1), py(0.25), sw(0.15), sh(0.35), color);
      break;
    case 'arm_right':
      fillBox(grid, px(0.75), py(0.25), sw(0.15), sh(0.35), color);
      break;
    case 'leg_left':
      fillBox(grid, px(0.3), py(0.65), sw(0.15), sh(0.35), color);
      break;
    case 'leg_right':
      fillBox(grid, px(0.55), py(0.65), sw(0.15), sh(0.35), color);
      break;
  }

  return grid;
};

export const generateEntityLayers = (ctx: EntityContext): PixelLayer[] => {
  const layers: PixelLayer[] = [];

  // 1. Generate Anatomy Parts
  const torso = generatePart('torso', ctx);
  const head = generatePart('head', ctx);
  const lArm = generatePart('arm_left', ctx);
  const rArm = generatePart('arm_right', ctx);
  const lLeg = generatePart('leg_left', ctx);
  const rLeg = generatePart('leg_right', ctx);

  // 2. Add to Layers (Z-Ordered)
  layers.push({ name: 'leg_left', pixels: lLeg, zIndex: 0 });
  layers.push({ name: 'leg_right', pixels: rLeg, zIndex: 0 });
  layers.push({ name: 'torso', pixels: torso, zIndex: 1 });
  layers.push({ name: 'head', pixels: head, zIndex: 2 });
  layers.push({ name: 'arm_left', pixels: lArm, zIndex: 3 });
  layers.push({ name: 'arm_right', pixels: rArm, zIndex: 3 });

  return layers;
};

export const composeLayers = (layers: PixelLayer[]): (string | null)[][] => {
  if (layers.length === 0) return createEmptyGrid(32); // Default fallback

  // Assume all layers match the dimensions of the first layer (which came from Generate)
  const gridSize = layers[0].pixels.length;

  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  const finalGrid = createEmptyGrid(gridSize);

  for (const layer of sorted) {
    const layerSize = layer.pixels.length;

    for (let y = 0; y < Math.min(gridSize, layerSize); y++) {
      for (let x = 0; x < Math.min(gridSize, layerSize); x++) {
        const srcPixel = layer.pixels[y][x];
        if (srcPixel && srcPixel !== 'transparent') {
          finalGrid[y][x] = srcPixel;
        }
      }
    }
  }
  return finalGrid;
};

export const synthesizeEntityBlueprint = (ctx: EntityContext): ZoneType[][] => {
  const gridSize = ctx.width;
  const grid = createEmptyGrid(gridSize);

  const px = (p: number) => Math.floor(gridSize * p);
  const py = (p: number) => Math.floor(gridSize * p);
  const sw = (p: number) => Math.max(1, Math.floor(gridSize * p));
  const sh = (p: number) => Math.max(1, Math.floor(gridSize * p));

  // Mark zones roughly where we drew parts
  // Head
  markBox(grid, px(0.35), py(0.05), sw(0.3), sh(0.2), 'head');
  // Torso
  markBox(grid, px(0.25), py(0.25), sw(0.5), sh(0.4), 'core');
  // Hands
  markBox(grid, px(0.1), py(0.25), sw(0.15), sh(0.35), 'hand_l');
  markBox(grid, px(0.75), py(0.25), sw(0.15), sh(0.35), 'hand_r');
  // Legs
  markBox(grid, px(0.3), py(0.65), sw(0.15), sh(0.35), 'legs');
  markBox(grid, px(0.55), py(0.65), sw(0.15), sh(0.35), 'legs');

  return grid as unknown as ZoneType[][];
};
