import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'shield',
  name: 'Shield',
  description:
    'A shield is made from wood or metal and is carried in one hand. Wielding a shield increases your Armor Class by 2. You can benefit from only one shield at a time.',
  type: 'armor',
  rarity: 'common',
  value: 10,
  weight: 6,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 2,
    armor_class_dex_bonus: false,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
