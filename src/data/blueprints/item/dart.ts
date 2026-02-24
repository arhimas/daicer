import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'dart',
  name: 'Dart',
  description: 'A small, pointed missile intended to be thrown by hand.',
  type: 'weapon',
  rarity: 'common',
  value: 5,
  weight: 0.25,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d4',
    damage_type: 'piercing',
    range_normal: 20,
    properties: ['finesse', 'thrown'],
    str_minimum: 0,
  },
});
