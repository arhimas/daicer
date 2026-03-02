import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Throne",
  slug: "throne",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 0,
  temperature: 0.5,
  tags: [
    "artificial",
    "furniture",
    "royal"
  ],
  texture: createSolidTexture('#fdd835')
});
