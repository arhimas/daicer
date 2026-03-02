import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Sandstone",
  slug: "sandstone",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.7,
  tags: [
    "natural"
  ],
  texture: createSolidTexture('#f57f17')
});
