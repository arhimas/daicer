import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'roguish-archetype-feature',
  name: 'Roguish Archetype feature',
  compilation_state: {
    status: 'Valid',
  },
  description: 'At 17th level, you gain a feature granted by your Roguish Archetype.',
  level: 17,
  tags: ['rogue'],
});
