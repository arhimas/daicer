import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'shortsword',
  name: 'Shortsword',
  description: 'A martial melee weapon that is common among soldiers and adventurers alike.',
  type: 'weapon',
  rarity: 'common',
  value: 10,
  weight: 2,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d6',
    damage_type: 'piercing',
    range_normal: 5,
    properties: ['finesse', 'light', 'monk'],
  },
});
