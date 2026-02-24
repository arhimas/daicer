import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Swarm',
  description:
    "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a Tiny raven. The swarm can't regain hit points or gain temporary hit points.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'swarm-of-ravens-swarm',
});
