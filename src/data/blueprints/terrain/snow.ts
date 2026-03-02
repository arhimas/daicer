import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Snow",
  slug: "snow",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.8,
  temperature: 0.1,
  tags: [
    "natural",
    "cold"
  ],
  texture: createSolidTexture('#ffffff')
});
