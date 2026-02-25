import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'saddle-pack',
  name: 'Saddle, Pack',
  description: 'A pack saddle is designed to carry gear and supplies on a mount, rather than a rider.',
  type: 'container',
  rarity: 'common',
  value: 5,
  weight: 15,
  size: 'Medium',
  tags: ['mounts-and-vehicles', 'tack-harness-and-drawn-vehicles'],
});
