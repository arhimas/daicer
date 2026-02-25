import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'jack-of-all-trades',
  name: 'Jack of All Trades',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "Starting at 2nd level, you can add half your proficiency bonus, rounded down, to any ability check you make that doesn't already include your proficiency bonus.",
  embedding: {},
  image: '',
  level: 2,
  lore: "A bard's education is never truly finished, picking up bits and pieces of knowledge from every corner of the world.",
  tags: ['bard'],
});
