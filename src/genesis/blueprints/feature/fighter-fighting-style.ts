import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'fighting-style',
  name: 'Fighting Style',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard 5e Fighter class feature.',
  },
  description:
    "You adopt a particular style of fighting as your specialty. Choose one of the following options. You can't take a Fighting Style option more than once, even if you later get to choose again.",
  level: 1,
  tags: ['fighter'],
});
