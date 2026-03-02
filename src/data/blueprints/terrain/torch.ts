import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Torch",
  slug: "torch",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 14,
  moisture: 0,
  temperature: 0.8,
  tags: [
    "artificial",
    "light"
  ],
  texture: createSolidTexture('#ffeb3b')
});
