import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Echolocation',
  description: "The swarm can't use its blindsight while deafened.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'swarm-of-bats-echolocation',
});
