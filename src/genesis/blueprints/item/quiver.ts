import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'quiver',
  name: 'Quiver',
  description: 'A quiver can hold up to 20 arrows.',
  type: 'container',
  rarity: 'common',
  value: 1,
  weight: 1,
  size: 'Medium',
});
