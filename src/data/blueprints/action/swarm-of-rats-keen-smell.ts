import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Smell',
  description: 'The swarm has advantage on Wisdom (Perception) checks that rely on smell.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'swarm-of-rats-keen-smell',
});
