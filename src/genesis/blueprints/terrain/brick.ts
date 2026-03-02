import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Brick",
  slug: "brick",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.1,
  temperature: 0.5,
  tags: [
    "artificial"
  ],
  texture: createSolidTexture('#b71c1c')
});
