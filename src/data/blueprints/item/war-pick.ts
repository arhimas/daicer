import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'war-pick',
  name: 'War pick',
  type: 'weapon',
  rarity: 'common',
  value: 5,
  weight: 2,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d8',
    damage_type: 'piercing',
    range_normal: 5,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
  compilation_state: {
    status: 'Valid',
  },
});
