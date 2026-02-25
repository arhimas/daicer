import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'piton',
  name: 'Piton',
  description:
    'A metal spike that can be driven into a crack or crevice in rock to provide an anchor point for a rope.',
  type: 'loot',
  rarity: 'common',
  value: 5,
  weight: 0.25,
  size: 'Medium',
});
