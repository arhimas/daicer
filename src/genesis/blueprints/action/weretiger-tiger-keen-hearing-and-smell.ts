import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Hearing and Smell',
  description: 'The weretiger has advantage on Wisdom (Perception) checks that rely on hearing or smell.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'weretiger-tiger-keen-hearing-and-smell',
});
