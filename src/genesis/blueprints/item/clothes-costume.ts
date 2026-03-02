import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'clothes-costume',
  name: 'Clothes, costume',
  description: 'A set of clothes for a specific character or role, often used by entertainers or for disguises.',
  type: 'loot',
  rarity: 'common',
  value: 5,
  weight: 4,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
});
