import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Void Stone",
  slug: "void-stone",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0,
  tags: [
    "magical",
    "dark"
  ],
  texture: createSolidTexture('#0a0a0a')
});
