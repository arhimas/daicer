import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'tongue-of-the-sun-and-moon',
  name: 'Tongue of the Sun and Moon',
  compilation_state: {
    status: 'Valid',
    hash: 'f8e9d2c1',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully imported Monk class feature from reference data.',
  },
  description:
    'Starting at 13th level, you learn to touch the ki of other minds so that you understand all spoken languages. Moreover, any creature that can understand a language can understand what you say.',
  level: 13,
  tags: ['monk'],
});
