import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'flurry-of-blows',
  name: 'Flurry of Blows',
  compilation_state: {
    status: 'Valid',
    hash: '8f2e9a1b',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature compiled from reference data.',
  },
  description:
    'Immediately after you take the Attack action on your turn, you can spend 1 ki point to make two unarmed strikes as a bonus action.',
  embedding: {},
  image: '',
  level: 2,
  lore: 'Through discipline and the mastery of ki, a monk can unleash a torrent of strikes in the blink of an eye.',
  tags: ['monk', 'class-feature'],
});
