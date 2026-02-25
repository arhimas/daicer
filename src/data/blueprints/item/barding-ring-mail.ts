import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'barding-ring-mail',
  name: 'Barding: Ring mail',
  description:
    "Barding is armor designed to protect an animal's head, neck, chest, and body. Any type of armor shown on the Armor table can be purchased as barding. The cost is four times the equivalent armor made for humanoids, and it weighs twice as much.",
  type: 'armor',
  rarity: 'common',
  value: 12,
  weight: 80,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 14,
    armor_class_dex_bonus: false,
    str_minimum: 0,
    stealth_disadvantage: true,
  },
});
