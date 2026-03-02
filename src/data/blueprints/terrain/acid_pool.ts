import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Acid Pool",
  slug: "acid-pool",
  isWalkable: false,
  isTransparent: false,
  isLiquid: true,
  damagePerTick: 5,
  luminance: 4,
  moisture: 1,
  temperature: 0.6,
  tags: [
    "industrial",
    "hazard",
    "liquid"
  ],
  texture: createSolidTexture('#76ff03')
});
