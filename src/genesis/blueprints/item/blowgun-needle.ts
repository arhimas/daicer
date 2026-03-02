import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'blowgun-needle',
  name: 'Blowgun needle',
  description: 'A bundle of 50 small, sharp needles used as ammunition for a blowgun.',
  type: 'loot',
  rarity: 'common',
  value: 1,
  weight: 1,
  size: 'Medium',
  equipment_data: {
    properties: ['ammunition'],
  },
});
