import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'crossbow-hand',
  name: 'Crossbow, hand',
  type: 'weapon',
  rarity: 'common',
  value: 75,
  weight: 3,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d6',
    damage_type: 'piercing',
    range_normal: 30,
    range_long: 120,
    properties: ['ammunition', 'light', 'loading'],
  },
  compilation_state: {
    status: 'Valid',
  },
});
