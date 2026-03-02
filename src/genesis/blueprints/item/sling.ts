import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'sling',
  name: 'Sling',
  description:
    'A simple weapon that launches stones or lead bullets. It is favored for its portability and ease of finding ammunition.',
  type: 'weapon',
  rarity: 'common',
  value: 10,
  weight: 0,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d4',
    damage_type: 'bludgeoning',
    range_normal: 30,
    str_minimum: 0,
  },
});
