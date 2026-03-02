import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Grass",
  slug: "grass",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.6,
  temperature: 0.5,
  tags: [
    "natural",
    "vegetation"
  ],
  texture: createSolidTexture('#388e3c')
});
