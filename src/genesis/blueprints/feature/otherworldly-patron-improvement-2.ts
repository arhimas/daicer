import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'otherworldly-patron-feature',
  name: 'Otherworldly Patron feature',
  compilation_state: {
    status: 'Valid',
    hash: 'a7b8c9d0e1f2g3h4i5j6',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Warlock class feature for level 10.',
  },
  description:
    'At 10th level, you gain a feature granted by your Otherworldly Patron. Your choice of patron grants you specific features tailored to the nature of your pact at 1st, 6th, 10th, and 14th level.',
  embedding: {},
  image: '',
  level: 10,
  lore: "The connection between the mortal soul and the patron deepens, allowing the warlock to channel even greater fragments of their benefactor's power.",
  tags: ['warlock', 'class-feature', 'subclass-feature'],
});
