import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Diamond Ore",
  slug: "diamond-ore",
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
  texture: createSolidTexture('#00bcd4')
});
