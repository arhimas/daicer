import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'diplomats-pack',
  name: "Diplomat's Pack",
  description:
    'Includes a chest, 2 cases for maps and scrolls, a set of fine clothes, a bottle of ink, an ink pen, a lamp, 2 flasks of oil, 5 sheets of paper, a vial of perfume, sealing wax, and soap.',
  type: 'container',
  rarity: 'common',
  value: 39,
  weight: 36,
  size: 'Medium',
  equipment_data: {
    properties: [],
  },
  tags: ['adventuring-gear', 'equipment-packs'],
});
