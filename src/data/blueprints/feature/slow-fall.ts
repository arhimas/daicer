import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'slow-fall',
  name: 'Slow Fall',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'Beginning at 4th level, you can use your reaction when you fall to reduce any falling damage you take by an amount equal to five times your monk level.',
  level: 4,
  tags: ['monk'],
});
