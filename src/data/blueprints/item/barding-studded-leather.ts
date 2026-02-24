import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'barding-studded-leather',
  name: 'Barding: Studded Leather',
  description:
    "Barding is armor designed to protect an animal's head, neck, chest, and body. Any type of armor shown on the Armor table can be purchased as barding. The cost is four times the equivalent armor made for humanoids, and it weighs twice as much.",
  type: 'armor',
  rarity: 'common',
  value: 180,
  weight: 26,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 12,
    armor_class_dex_bonus: true,
    str_minimum: 0,
    stealth_disadvantage: false,
  },
});
