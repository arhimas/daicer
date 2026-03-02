import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'arcane-tradition-feature',
  name: 'Arcane Tradition feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature granted by the chosen Arcane Tradition at 6th level.',
  },
  description: 'At 6th level, you gain a feature granted by your Arcane Tradition.',
  level: 6,
  tags: ['wizard'],
});
