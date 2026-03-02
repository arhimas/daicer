import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Leaves",
  slug: "leaves",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.6,
  temperature: 0.5,
  tags: [
    "natural",
    "vegetation"
  ],
  texture: createSolidTexture('#2e7d32')
});
