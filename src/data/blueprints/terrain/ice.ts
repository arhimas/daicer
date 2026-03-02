import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Ice",
  slug: "ice",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.9,
  temperature: 0,
  tags: [
    "natural",
    "cold"
  ],
  texture: createSolidTexture('#90caf9')
});
