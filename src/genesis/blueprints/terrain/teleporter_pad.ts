import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Teleporter Pad",
  slug: "teleporter-pad",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 10,
  moisture: 0,
  temperature: 0.5,
  tags: [
    "artificial",
    "tech"
  ],
  texture: createSolidTexture('#00e5ff')
});
