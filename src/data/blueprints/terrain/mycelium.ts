import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Mycelium",
  slug: "mycelium",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.7,
  temperature: 0.5,
  tags: [
    "natural",
    "fungi"
  ],
  texture: createSolidTexture('#7e57c2')
});
