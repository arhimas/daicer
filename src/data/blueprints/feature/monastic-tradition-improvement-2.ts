import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'monastic-tradition-feature',
  name: 'Monastic Tradition feature',
  compilation_state: {
    status: 'Valid',
  },
  description: 'At 11th level, you gain a feature granted by your Monastic Tradition.',
  level: 11,
  tags: ['monk'],
});
