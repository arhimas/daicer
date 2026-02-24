import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'dagger',
  name: 'Dagger',
  description:
    'A dagger is a simple melee weapon, easy to conceal and effective in close quarters. It features the finesse, light, and thrown properties.',
  type: 'weapon',
  rarity: 'common',
  value: 2,
  weight: 1,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d4',
    damage_type: 'piercing',
    range_normal: 20,
    properties: ['finesse', 'light', 'thrown', 'monk'],
    str_minimum: 0,
    stealth_disadvantage: false,
  },
  compilation_state: {
    status: 'Valid',
  },
});
