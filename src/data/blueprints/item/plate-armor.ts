import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'plate-armor',
  name: 'Plate Armor',
  description:
    'Plate consists of shaped, interlocking metal plates to cover the entire body. A suit of plate includes gauntlets, heavy leather boots, a visored helmet, and thick layers of padding underneath the armor. Buckles and straps distribute the weight over the body.',
  type: 'armor',
  rarity: 'common',
  value: 1500,
  weight: 65,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 18,
    armor_class_dex_bonus: false,
    str_minimum: 15,
    stealth_disadvantage: true,
  },
});
