import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'whip',
  name: 'Whip',
  description: 'A martial melee weapon consisting of a long, flexible lash.',
  type: 'weapon',
  rarity: 'common',
  value: 2,
  weight: 3,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d4',
    damage_type: 'slashing',
    range_normal: 5,
    properties: ['finesse', 'reach'],
  },
});
