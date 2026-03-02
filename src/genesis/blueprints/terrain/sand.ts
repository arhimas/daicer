import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Sand",
  slug: "sand",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.8,
  tags: [
    "natural",
    "soil"
  ],
  texture: createSolidTexture('#fbc02d')
});
