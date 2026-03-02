import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Crafting Table",
  slug: "crafting-table",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.3,
  temperature: 0.5,
  tags: [
    "artificial"
  ],
  texture: createSolidTexture('#d7ccc8')
});
