import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'morningstar',
  name: 'Morningstar',
  description: 'A martial melee weapon consisting of a heavy, spiked metal ball attached to a handle.',
  type: 'weapon',
  rarity: 'common',
  value: 15,
  weight: 4,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d8',
    damage_type: 'piercing',
    range_normal: 5,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
