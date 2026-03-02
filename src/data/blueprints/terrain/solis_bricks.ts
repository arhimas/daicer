import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Solis Bricks",
  slug: "solis-bricks",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 10,
  moisture: 0,
  temperature: 0.9,
  tags: [
    "magical",
    "artificial"
  ],
  texture: createSolidTexture('#ffcc00')
});
