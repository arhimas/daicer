import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Obsidian",
  slug: "obsidian",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.2,
  tags: [
    "natural",
    "volcanic"
  ],
  texture: createSolidTexture('#000000')
});
