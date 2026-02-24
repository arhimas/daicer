import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'glaive',
  name: 'Glaive',
  description: 'A martial melee weapon consisting of a single-edged blade on the end of a pole.',
  type: 'weapon',
  rarity: 'common',
  value: 20,
  weight: 6,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d10',
    damage_type: 'slashing',
    range_normal: 5,
    properties: ['heavy', 'reach', 'two-handed'],
  },
});
