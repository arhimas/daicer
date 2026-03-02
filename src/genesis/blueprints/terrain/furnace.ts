import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Furnace",
  slug: "furnace",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.8,
  tags: [
    "artificial"
  ],
  texture: createSolidTexture('#616161')
});
