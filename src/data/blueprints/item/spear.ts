import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'spear',
  name: 'Spear',
  description:
    'A simple melee weapon. Versatile (1d8). A spear can be used to make a melee attack with one or two hands, or it can be thrown.',
  type: 'weapon',
  rarity: 'common',
  value: 1,
  weight: 3,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d6',
    versatile_dice: '1d8',
    damage_type: 'piercing',
    range_normal: 20,
    properties: ['thrown', 'versatile', 'monk'],
    str_minimum: 0,
    stealth_disadvantage: false,
  },
  compilation_state: {
    status: 'Valid',
  },
});
