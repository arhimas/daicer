import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'longbow',
  name: 'Longbow',
  description: 'A powerful martial ranged weapon that fires arrows with significant force over long distances.',
  type: 'weapon',
  rarity: 'common',
  value: 50,
  weight: 2,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d8',
    damage_type: 'piercing',
    range_normal: 150,
    str_minimum: 0,
  },
});
