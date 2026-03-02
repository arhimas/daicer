import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Bookshelf",
  slug: "bookshelf",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.2,
  temperature: 0.5,
  tags: [
    "artificial",
    "furniture"
  ],
  texture: createSolidTexture('#8d6e63')
});
