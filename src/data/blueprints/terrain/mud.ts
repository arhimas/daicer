import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Mud",
  slug: "mud",
  isWalkable: true,
  isTransparent: false,
  isLiquid: false,
  damagePerTick: 0,
  luminance: 0,
  moisture: 1,
  temperature: 0.5,
  tags: [
    "natural",
    "soil",
    "swamp"
  ],
  texture: createSolidTexture('#4e342e')
});
