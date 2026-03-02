import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Wood",
  slug: "wood",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.4,
  temperature: 0.5,
  tags: [
    "natural",
    "vegetation"
  ],
  texture: createSolidTexture('#5d4037')
});
