import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style',
  name: 'Fighting Style',
  compilation_state: {
    status: 'Valid',
    summary: 'Generated from paladin class feature reference data.',
  },
  description:
    "At 2nd level, you adopt a style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if you later get to choose again.",
  embedding: {},
  image: '',
  level: 2,
  lore: 'The martial discipline of a paladin is a physical manifestation of their divine commitment.',
  tags: ['paladin', 'class-feature'],
});
