import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Fence",
  slug: "fence",
  isWalkable: false,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.3,
  temperature: 0.5,
  tags: [
    "artificial"
  ],
  texture: createSolidTexture('#8d6e63')
});
