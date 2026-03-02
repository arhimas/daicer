import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Spike Trap",
  slug: "spike-trap",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 15,
  luminance: 0,
  moisture: 0.3,
  temperature: 0.5,
  tags: [
    "artificial",
    "trap"
  ],
  texture: createSolidTexture('#9e9e9e')
});
