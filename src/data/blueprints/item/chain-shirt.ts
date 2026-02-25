import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'chain-shirt',
  name: 'Chain Shirt',
  description:
    "Made of interlocking metal rings, a chain shirt is worn between layers of clothing or leather. This armor offers modest protection to the wearer's upper body and allows the sound of the rings rubbing against one another to be muffled by outer layers.",
  type: 'armor',
  rarity: 'common',
  value: 50,
  weight: 20,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 13,
    armor_class_dex_bonus: true,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
