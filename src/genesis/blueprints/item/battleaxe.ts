import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'battleaxe',
  name: 'Battleaxe',
  description:
    'A martial melee weapon that deals 1d8 slashing damage. It has the versatile property, allowing it to be used with two hands to deal 1d10 slashing damage.',
  type: 'weapon',
  rarity: 'common',
  value: 10,
  weight: 4,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d8',
    versatile_dice: '1d10',
    damage_type: 'slashing',
    range_normal: 5,
    properties: ['versatile'],
  },
  tags: ['martial-weapon', 'melee-weapon'],
});
