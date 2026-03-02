import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Water",
  slug: "water",
  isWalkable: true,
  isTransparent: true,
  isLiquid: true,
  damagePerTick: 0,
  luminance: 0,
  moisture: 1,
  temperature: 0.5,
  tags: [
    "natural",
    "liquid"
  ],
  texture: createSolidTexture('#1976d2')
});
