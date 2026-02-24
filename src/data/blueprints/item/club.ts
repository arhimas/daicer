import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'club',
  name: 'Club',
  description: 'A simple, heavy wooden stick used as a weapon.',
  type: 'weapon',
  rarity: 'common',
  value: 1,
  weight: 2,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d4',
    damage_type: 'bludgeoning',
    range_normal: 5,
    properties: ['light', 'monk'],
  },
  compilation_state: {
    status: 'Valid',
  },
});
