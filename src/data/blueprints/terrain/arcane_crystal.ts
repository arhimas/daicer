import { defineTerrain, createSolidTexture } from '@/features/genesis-core/blueprints';

export default defineTerrain({
  name: "Arcane Crystal",
  slug: "arcane-crystal",
  isWalkable: true,
  isTransparent: true,
  isLiquid: false,
  damagePerTick: 1,
  luminance: 8,
  moisture: 0.5,
  temperature: 0.5,
  tags: [
    "magical",
    "hazard"
  ],
  texture: createSolidTexture('#800080')
});
