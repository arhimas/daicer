import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Air",
  slug: "air",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.5,
  temperature: 0.5,
  tags: [
    "core"
  ],
  texture: createSolidTexture('transparent')
});
