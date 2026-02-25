import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'brutal-critical-2-dice',
  name: 'Brutal Critical (2 dice)',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack. This increases to two additional dice at 13th level and three additional dice at 17th level.',
  embedding: {},
  image: 'https://example.com/images/brutal-critical.png',
  level: 13,
  lore: "The barbarian's strikes become devastatingly powerful, crushing bone and rending flesh beyond measure when luck favors their swing.",
  tags: ['barbarian'],
});
