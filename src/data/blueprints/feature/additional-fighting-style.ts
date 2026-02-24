import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'additional-fighting-style',
  name: 'Additional Fighting Style',
  compilation_state: {
    status: 'Valid',
  },
  description: 'At 10th level, you can choose a second option from the Fighting Style class feature.',
  level: 10,
  tags: ['fighter', 'champion'],
});
