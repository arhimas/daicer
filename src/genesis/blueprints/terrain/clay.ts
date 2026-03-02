import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Clay",
  slug: "clay",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.8,
  temperature: 0.5,
  tags: [
    "natural"
  ],
  texture: createSolidTexture('#9fa8da')
});
