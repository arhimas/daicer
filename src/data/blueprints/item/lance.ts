import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'lance',
  name: 'Lance',
  description:
    "You have disadvantage when you use a lance to attack a target within 5 feet of you. Also, a lance requires two hands to wield when you aren't mounted.",
  type: 'weapon',
  rarity: 'common',
  value: 10,
  weight: 6,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d12',
    damage_type: 'piercing',
    range_normal: 5,
    properties: ['reach', 'special'],
  },
});
