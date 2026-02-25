import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'brutal-critical-1-die',
  name: 'Brutal Critical (1 die)',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard Barbarian class feature at level 9.',
  },
  description:
    'Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack. This increases to two additional dice at 13th level and three additional dice at 17th level.',
  level: 9,
  tags: ['barbarian'],
});
