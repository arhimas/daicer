import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'crossbow-bolt',
  name: 'Crossbow bolt',
  description: 'Ammunition for use with crossbows. This entry represents a bundle of 20 bolts.',
  type: 'loot',
  rarity: 'common',
  value: 1,
  weight: 1.5,
  size: 'Medium',
});
