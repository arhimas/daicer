import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'extra-attack-3',
  name: 'Extra Attack (3)',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data for the Fighter class feature.',
  },
  description:
    'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.',
  level: 20,
  tags: ['fighter'],
});
