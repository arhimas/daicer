import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Swarm',
  description:
    "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny snake. The swarm can't regain hit points or gain temporary hit points.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'swarm-of-poisonous-snakes-swarm',
});
