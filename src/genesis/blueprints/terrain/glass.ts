import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Glass",
  slug: "glass",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.5,
  tags: [
    "artificial"
  ],
  texture: createSolidTexture('rgba(255, 255, 255, 0.3)')
});
