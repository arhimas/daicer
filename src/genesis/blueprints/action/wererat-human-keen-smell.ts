import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Smell',
  description: 'The wererat has advantage on Wisdom (Perception) checks that rely on smell.',
  type: 'ability',
  slug: 'wererat-human-keen-smell',
});
