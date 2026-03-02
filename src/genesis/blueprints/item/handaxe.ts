import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'handaxe',
  name: 'Handaxe',
  description:
    'A simple melee weapon. The handaxe is a light, versatile tool and weapon, often used for woodcutting and close-quarters combat. It is balanced for throwing as well.',
  type: 'weapon',
  rarity: 'common',
  value: 5,
  weight: 2,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d6',
    damage_type: 'slashing',
    range_normal: 20,
    properties: ['light', 'thrown', 'monk'],
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
