import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'peerless-skill',
  name: 'Peerless Skill',
  compilation_state: {
    status: 'Valid',
    hash: 'b7f9a8c2',
    last_run: '2023-10-27',
    summary: 'Feature successfully compiled from reference SRD data.',
  },
  description:
    'Starting at 14th level, when you make an ability check, you can expend one use of Bardic Inspiration. Roll a Bardic Inspiration die and add the number rolled to your ability check. You can choose to do so after you roll the die for the ability check, but before the GM tells you whether you succeed or fail.',
  embedding: {},
  image: '',
  level: 14,
  lore: 'Your mastery of lore and artistic discipline allows you to push past your limits, tapping into a wellspring of inspiration to succeed where others falter.',
  tags: ['bard', 'lore', 'class-feature'],
});
