import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Permafrost",
  slug: "permafrost",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.5,
  temperature: 0,
  tags: [
    "natural",
    "cold",
    "soil"
  ],
  texture: createSolidTexture('#cfd8dc')
});
