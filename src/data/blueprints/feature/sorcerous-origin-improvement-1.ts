import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'sorcerous-origin-feature',
  name: 'Sorcerous Origin feature',
  compilation_state: {
    status: 'Valid',
  },
  description: 'At 6th level, you gain a feature granted by your Sorcerous Origin.',
  level: 6,
  tags: ['sorcerer'],
});
