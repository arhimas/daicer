import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'crossbow-heavy',
  name: 'Crossbow, heavy',
  type: 'weapon',
  rarity: 'common',
  value: 50,
  weight: 18,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d10',
    damage_type: 'piercing',
    range_normal: 100,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
  compilation_state: {
    status: 'Valid',
  },
  width: 100,
});
