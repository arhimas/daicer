import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'otherworldly-patron',
  name: 'Otherworldly Patron',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from source data.',
  },
  description:
    'At 1st level, you have struck a bargain with an otherworldly being of your choice, such as the Fiend. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.',
  embedding: {},
  level: 1,
  lore: 'The beings that serve as patrons for warlocks are mighty inhabitants of other planes of existence—not gods, but almost godlike in their power.',
  tags: ['warlock', 'class-feature'],
});
