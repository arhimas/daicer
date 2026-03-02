import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'flask-or-tankard',
  name: 'Flask or tankard',
  description: 'A flask or tankard can hold 1 pint of liquid.',
  type: 'container',
  rarity: 'common',
  value: 2,
  weight: 1,
  size: 'Medium',
});
