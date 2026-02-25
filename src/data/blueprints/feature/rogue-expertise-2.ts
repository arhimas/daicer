import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'expertise',
  name: 'Expertise',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "At 6th level, you can choose two more of your proficiencies (in skills or with thieves' tools) to gain this benefit: your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.",
  embedding: {},
  image: '',
  level: 6,
  lore: '',
  tags: ['rogue'],
});
