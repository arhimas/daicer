import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'flail',
  name: 'Flail',
  type: 'weapon',
  rarity: 'common',
  value: 10,
  weight: 2,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d8',
    damage_type: 'bludgeoning',
    range_normal: 5,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
  compilation_state: {
    status: 'Valid',
  },
});
