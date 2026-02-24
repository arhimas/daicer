import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'chain-10-feet',
  name: 'Chain (10 feet)',
  description: 'A chain has 10 hit points. It can be burst with a successful DC 20 Strength check.',
  type: 'loot',
  rarity: 'common',
  value: 5,
  weight: 10,
  size: 'Medium',
});
