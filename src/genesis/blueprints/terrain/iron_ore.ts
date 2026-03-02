import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Iron Ore",
  slug: "iron-ore",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.1,
  temperature: 0.5,
  tags: [
    "natural",
    "ore"
  ],
  texture: createSolidTexture('#d7ccc8')
});
