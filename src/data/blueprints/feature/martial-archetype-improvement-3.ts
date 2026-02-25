import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'martial-archetype-feature',
  name: 'Martial Archetype feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Generated from SRD 5.1 reference data.',
  },
  description: 'At 15th level, you gain a feature granted by your Martial Archetype.',
  level: 15,
  tags: ['fighter'],
});
