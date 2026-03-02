import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Scaffolding",
  slug: "scaffolding",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0.2,
  temperature: 0.5,
  tags: [
    "artificial",
    "industrial"
  ],
  texture: createSolidTexture('#ffecb3')
});
