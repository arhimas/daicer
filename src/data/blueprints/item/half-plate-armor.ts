import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'half-plate-armor',
  name: 'Half Plate Armor',
  description:
    "Half plate consists of shaped metal plates that cover most of the wearer's body. It does not include leg protection beyond simple greaves that are attached with leather straps.",
  type: 'armor',
  rarity: 'common',
  value: 750,
  weight: 40,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 15,
    armor_class_dex_bonus: true,
    str_minimum: 0,
    stealth_disadvantage: true,
  },
});
