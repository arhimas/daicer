import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Cobblestone",
  slug: "cobblestone",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.2,
  temperature: 0.5,
  tags: [
    "artificial"
  ],
  texture: createSolidTexture('#616161')
});
