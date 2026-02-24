import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'arcane-tradition-feature',
  name: 'Arcane Tradition feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Level 10 Wizard Arcane Tradition feature improvement.',
  },
  description:
    'At 10th level, you gain a feature granted by your Arcane Tradition. When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools. Your choice grants you features at 2nd level and again at 6th, 10th, and 14th level.',
  level: 10,
  tags: ['wizard'],
});
