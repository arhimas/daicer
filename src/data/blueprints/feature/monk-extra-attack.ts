import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'extra-attack',
  name: 'Extra Attack',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.',
  level: 5,
  tags: ['monk'],
});
