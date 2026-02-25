import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'arcane-tradition-feature',
  name: 'Arcane Tradition feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from Wizard class feature data.',
  },
  description: 'At 14th level, you gain a feature granted by your Arcane Tradition.',
  level: 14,
  tags: ['wizard'],
});
