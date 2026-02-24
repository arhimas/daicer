import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'lock',
  name: 'Lock',
  description:
    "A key is provided with the lock. Without the key, a creature proficient with thieves' tools can pick this lock with a successful DC 15 Dexterity check. Your GM may decide that better locks are available for higher prices.",
  type: 'loot',
  rarity: 'common',
  value: 10,
  weight: 1,
  size: 'Medium',
});
