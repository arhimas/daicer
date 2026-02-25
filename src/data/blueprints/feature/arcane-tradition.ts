import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'arcane-tradition',
  name: 'Arcane Tradition',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully extracted from reference data.',
  },
  description:
    'When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools, such as Evocation. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level.',
  level: 2,
  tags: ['wizard', 'class-feature', 'subclass-selection'],
});
