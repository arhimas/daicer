import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Hold Breath',
  description: 'The hydra can hold its breath for 1 hour.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'hydra-hold-breath',
});
