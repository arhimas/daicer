import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'sorcerous-origin-feature',
  name: 'Sorcerous Origin feature',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'At 18th level, you gain a feature granted by your sorcerous origin. Your choice of origin grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.',
  level: 18,
  tags: ['sorcerer'],
});
