import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Hearing and Sight',
  description: 'The scout has advantage on Wisdom (Perception) checks that rely on hearing or sight.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'scout-keen-hearing-and-sight',
});
