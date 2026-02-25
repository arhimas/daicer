import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'extra-attack',
  name: 'Extra Attack',
  compilation_state: {
    status: 'Valid',
    hash: '4e8b9c2a1f0d3e5b',
    last_run: '2023-10-27',
    summary: 'Successfully compiled from standard 5e feature data.',
  },
  description:
    'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.',
  embedding: {},
  image: '',
  level: 5,
  lore: '',
  tags: ['barbarian'],
});
