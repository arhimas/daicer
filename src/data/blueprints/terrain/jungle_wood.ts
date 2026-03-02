import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Jungle Wood",
  slug: "jungle-wood",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.9,
  temperature: 0.8,
  tags: [
    "natural",
    "vegetation",
    "jungle"
  ],
  texture: createSolidTexture('#3e2723')
});
