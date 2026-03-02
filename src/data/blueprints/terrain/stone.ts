import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Stone",
  slug: "stone",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.1,
  temperature: 0.5,
  tags: [
    "natural",
    "mineral"
  ],
  texture: createSolidTexture('#7d7d7d')
});
