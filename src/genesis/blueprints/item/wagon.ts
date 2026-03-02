import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'wagon',
  name: 'Wagon',
  description:
    'A wagon is a four-wheeled vehicle drawn by two or more horses or other beasts of burden. It is used for transporting goods and passengers over long distances.',
  type: 'tool',
  rarity: 'common',
  value: 35,
  weight: 400,
  size: 'Medium',
});
