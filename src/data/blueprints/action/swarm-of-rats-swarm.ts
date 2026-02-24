import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Swarm',
  description:
    "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny rat. The swarm can't regain hit points or gain temporary hit points.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'swarm-of-rats-swarm',
});
