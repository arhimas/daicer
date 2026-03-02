import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'clothes-fine',
  name: 'Clothes, fine',
  description:
    'This set of clothes is designed specifically to be worn in court or for a formal gala. It includes expensive fabrics and jewelry.',
  type: 'loot',
  rarity: 'common',
  value: 15,
  weight: 6,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
});
