import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Smell',
  description: 'The cat has advantage on Wisdom (Perception) checks that rely on smell.',
  type: 'ability',
  slug: 'cat-keen-smell',
});
