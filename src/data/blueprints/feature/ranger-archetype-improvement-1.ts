import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ranger-archetype-feature',
  name: 'Ranger Archetype feature',
  compilation_state: {
    status: 'Valid',
    hash: '8f2e1a3b4c5d6e7f8g9h0i1j2k3l4m5n',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from reference data.',
  },
  description: 'At 7th level, you gain a feature granted by your Ranger Archetype choice.',
  level: 7,
  tags: ['ranger', 'class-feature', 'subclass-feature'],
});
