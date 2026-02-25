import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'warhorse',
  name: 'Warhorse',
  description: 'A powerful horse trained for combat. Speed: 60 ft. Capacity: 540 lb.',
  type: 'loot',
  rarity: 'common',
  value: 400,
  weight: 0,
  size: 'Large',
  tags: ['mount', 'mounts-and-vehicles'],
});
