import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'bottle-glass',
  name: 'Bottle, glass',
  description: 'A glass bottle that can hold up to 1.5 pints of liquid.',
  type: 'container',
  rarity: 'common',
  value: 2,
  weight: 2,
  size: 'Medium',
  width: 100,
});
