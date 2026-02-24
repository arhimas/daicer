import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'scale-mail',
  name: 'Scale Mail',
  description:
    'This armor consists of a coat and leggings (and perhaps a separate skirt) of leather covered with overlapping pieces of metal, much like the scales of a fish. The suit includes gauntlets.',
  type: 'armor',
  rarity: 'common',
  value: 50,
  weight: 45,
  size: 'Medium',
  equipment_data: {
    armor_class_base: 14,
    armor_class_dex_bonus: true,
    str_minimum: 0,
    stealth_disadvantage: true,
  },
});
