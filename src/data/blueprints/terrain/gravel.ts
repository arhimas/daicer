import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Gravel",
  slug: "gravel",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.2,
  temperature: 0.5,
  tags: [
    "natural",
    "soil"
  ],
  texture: createSolidTexture('#9e9e9e')
});
