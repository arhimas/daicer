import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'splint-armor',
  name: 'Splint Armor',
  description:
    'This armor is made of narrow vertical strips of metal riveted to a backing of leather that is worn over cloth padding. Flexible chain mail protects the joints.',
  type: 'armor',
  rarity: 'common',
  value: 200,
  weight: 60,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 17,
    armor_class_dex_bonus: false,
    str_minimum: 15,
    stealth_disadvantage: true,
  },
});
