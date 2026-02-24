import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'barding-hide',
  name: 'Barding: Hide',
  description:
    "Barding is armor designed to protect an animal's head, neck, chest, and body. Any type of armor shown on the Armor table can be purchased as barding. The cost is four times the equivalent armor made for humanoids, and it weighs twice as much.",
  type: 'armor',
  rarity: 'common',
  value: 40,
  weight: 24,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 12,
    armor_class_dex_bonus: true,
    stealth_disadvantage: false,
  },
});
