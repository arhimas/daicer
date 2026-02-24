import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style-archery',
  name: 'Fighting Style: Archery',
  compilation_state: {
    status: 'Valid',
  },
  description: 'You gain a +2 bonus to attack rolls you make with ranged weapons.',
  level: 1,
  tags: ['fighter'],
});
