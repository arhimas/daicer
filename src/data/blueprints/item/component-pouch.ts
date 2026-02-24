import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'component-pouch',
  name: 'Component pouch',
  description:
    "A component pouch is a small, watertight leather belt pouch that has compartments to hold all the material components and other special items you need to cast your spells, except for those components that have a specific cost (as indicated in a spell's description).",
  type: 'tool',
  rarity: 'common',
  value: 25,
  weight: 2,
  size: 'Medium',
});
