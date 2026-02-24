import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'aura-improvements',
  name: 'Aura improvements',
  compilation_state: {
    status: 'Valid',
  },
  description: 'At 18th level, the range of your auras increase to 30 feet.',
  level: 18,
  tags: ['paladin'],
});
