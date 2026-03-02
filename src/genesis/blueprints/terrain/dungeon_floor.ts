import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Dungeon Floor",
  slug: "dungeon-floor",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.6,
  temperature: 0.3,
  tags: [
    "dungeon",
    "artificial"
  ],
  texture: createSolidTexture('#455a64')
});
