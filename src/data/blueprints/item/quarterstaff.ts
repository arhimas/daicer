import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'quarterstaff',
  name: 'Quarterstaff',
  description:
    'A quarterstaff is a simple melee weapon. It is versatile, meaning it can be used with one or two hands. When used with two hands, it deals 1d8 bludgeoning damage.',
  type: 'weapon',
  rarity: 'common',
  value: 20,
  weight: 4,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d6',
    versatile_dice: '1d8',
    damage_type: 'bludgeoning',
    range_normal: 5,
    properties: ['versatile', 'monk'],
  },
  compilation_state: {
    status: 'Valid',
  },
});
