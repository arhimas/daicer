import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'cart',
  name: 'Cart',
  description: 'A two-wheeled vehicle drawn by a single beast of burden.',
  type: 'tool',
  rarity: 'common',
  value: 15,
  weight: 200,
  size: 'Large',
  equipment_data: {
    properties: [],
  },
  tags: ['mounts-and-vehicles', 'tack-harness-and-drawn-vehicles'],
});
