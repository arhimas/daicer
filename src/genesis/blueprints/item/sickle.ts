import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'sickle',
  name: 'Sickle',
  description:
    'A sickle is a simple melee weapon with a curved blade, often used for harvesting crops but effective in close-quarters combat.',
  type: 'weapon',
  rarity: 'common',
  value: 1,
  weight: 2,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d4',
    damage_type: 'slashing',
    range_normal: 5,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
