import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Red Sand",
  slug: "red-sand",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.9,
  tags: [
    "natural",
    "soil",
    "desert"
  ],
  texture: createSolidTexture('#bf360c')
});
