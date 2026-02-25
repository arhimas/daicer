import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'mule',
  name: 'Mule',
  description:
    'A mule is a mount and vehicle categorized under Mounts and Other Animals. It has a speed of 40 ft/round and a carrying capacity of 420 lb.',
  type: 'loot',
  rarity: 'common',
  value: 8,
  weight: 0,
  size: 'Medium',
});
