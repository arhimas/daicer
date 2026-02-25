import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style',
  name: 'Fighting Style',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "At 2nd level, you adopt a particular style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if you later get to choose again.",
  level: 2,
  tags: ['ranger'],
});
