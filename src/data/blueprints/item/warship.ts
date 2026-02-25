import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'warship',
  name: 'Warship',
  description:
    'A large waterborne vehicle designed for naval warfare. Vehicle Category: Waterborne Vehicles. Speed: 2.5 mph.',
  type: 'loot',
  rarity: 'common',
  value: 25000,
  weight: 0,
  size: 'Medium',
});
