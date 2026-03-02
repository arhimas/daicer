import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Ethereal Mist",
  slug: "ethereal-mist",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 4,
  moisture: 1,
  temperature: 0.5,
  tags: [
    "magical",
    "gas"
  ],
  texture: createSolidTexture('rgba(230, 230, 250, 0.4)')
});
