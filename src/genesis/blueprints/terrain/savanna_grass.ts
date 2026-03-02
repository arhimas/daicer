import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Savanna Grass",
  slug: "savanna-grass",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.3,
  temperature: 0.8,
  tags: [
    "natural",
    "vegetation",
    "savanna"
  ],
  texture: createSolidTexture('#8bc34a')
});
