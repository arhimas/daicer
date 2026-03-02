import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Bedrock",
  slug: "bedrock",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0,
  tags: [
    "natural",
    "indestructible"
  ],
  texture: createSolidTexture('#212121')
});
