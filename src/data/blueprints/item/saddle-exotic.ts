import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'saddle-exotic',
  name: 'Saddle, Exotic',
  description: 'An exotic saddle is required for riding any aquatic or flying mount.',
  type: 'tool',
  rarity: 'common',
  value: 60,
  weight: 50,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
});
