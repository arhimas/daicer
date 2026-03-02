import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'divine-domain-feature',
  name: 'Divine Domain feature',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature mapped from Cleric class at level 6.',
  },
  description:
    'Your domain grants you domain spells and other features when you choose it at 1st level. It also grants you additional ways to use Channel Divinity when you gain that feature at 2nd level, and additional benefits at 6th, 8th, and 17th levels.',
  level: 6,
  tags: ['cleric', 'class-feature'],
});
