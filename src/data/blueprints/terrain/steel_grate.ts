import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Steel Grate",
  slug: "steel-grate",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.5,
  tags: [
    "artificial",
    "industrial"
  ],
  texture: createSolidTexture('#607d8b')
});
