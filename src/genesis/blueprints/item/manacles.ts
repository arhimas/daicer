import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'manacles',
  name: 'Manacles',
  description:
    "These metal restraints can bind a Small or Medium creature. Escaping the manacles requires a successful DC 20 Dexterity check. Breaking them requires a successful DC 20 Strength check. Each set of manacles comes with one key. Without the key, a creature proficient with thieves' tools can pick the manacles' lock with a successful DC 15 Dexterity check. Manacles have 15 hit points.",
  type: 'tool',
  rarity: 'common',
  value: 2,
  weight: 6,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
});
