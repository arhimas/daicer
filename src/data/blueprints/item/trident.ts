import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'trident',
  name: 'Trident',
  description:
    'A trident is a three-pronged spear used for melee combat or thrown at a distance. As a versatile weapon, it can be wielded with one or two hands, dealing increased damage when used with both.',
  type: 'weapon',
  rarity: 'common',
  value: 5,
  weight: 4,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d6',
    damage_type: 'piercing',
    range_normal: 20,
    properties: ['thrown', 'versatile'],
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
