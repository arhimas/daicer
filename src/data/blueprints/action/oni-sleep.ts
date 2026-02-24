import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Sleep',
  description: '1/day spell: sleep',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 90,
    aoe_shape: 'Sphere',
    aoe_size: 20,
  },
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Unconscious',
      description: 'Affected by sleep spell',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'oni-sleep',
});
