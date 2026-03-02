import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Dirt",
  slug: "dirt",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.5,
  temperature: 0.5,
  tags: [
    "natural",
    "soil"
  ],
  texture: createSolidTexture('#5d4037')
});
