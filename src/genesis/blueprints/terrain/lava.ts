import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Lava",
  slug: "lava",
  isWalkable: false,
  isTransparent: false,
  isLiquid: true,
  damagePerTick: 10,
  luminance: 15,
  moisture: 0,
  temperature: 1,
  tags: [
    "natural",
    "hot",
    "hazard"
  ],
  texture: createSolidTexture('#d32f2f')
});
