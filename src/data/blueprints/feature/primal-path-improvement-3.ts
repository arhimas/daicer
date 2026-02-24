import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'path-feature',
  name: 'Path feature',
  compilation_state: {
    status: 'Valid',
    hash: '4f2e9a1b',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Feature mapped from Barbarian class data.',
  },
  description:
    'At 3rd level, you choose a path that shapes the nature of your rage. Your choice grants you features at 3rd level and again at 6th, 10th, and 14th levels.',
  embedding: {},
  image: '',
  level: 14,
  lore: 'The Primal Path defines how a barbarian channels their inner fury.',
  tags: ['barbarian'],
});
