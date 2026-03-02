import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Rusty Metal",
  slug: "rusty-metal",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.8,
  temperature: 0.5,
  tags: [
    "artificial",
    "decay"
  ],
  texture: createSolidTexture('#8d6e63')
});
