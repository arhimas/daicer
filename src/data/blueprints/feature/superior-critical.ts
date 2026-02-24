import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'superior-critical',
  name: 'Superior Critical',
  compilation_state: {
    status: 'Valid',
  },
  description: 'Starting at 15th level, your weapon attacks score a critical hit on a roll of 18-20.',
  level: 15,
  tags: ['fighter', 'champion'],
});
