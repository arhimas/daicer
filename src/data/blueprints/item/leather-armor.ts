import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'leather-armor',
  name: 'Leather Armor',
  description:
    'The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil. The rest of the armor is made of softer and more flexible materials.',
  type: 'armor',
  rarity: 'common',
  value: 10,
  weight: 10,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 11,
    armor_class_dex_bonus: true,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
