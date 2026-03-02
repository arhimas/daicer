import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Altar",
  slug: "altar",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 2,
  moisture: 0,
  temperature: 0.5,
  tags: [
    "artificial",
    "religious"
  ],
  texture: createSolidTexture('#263238')
});
