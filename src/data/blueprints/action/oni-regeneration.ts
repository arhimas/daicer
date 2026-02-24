import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Regeneration',
  description: 'The oni regains 10 hit points at the start of its turn if it has at least 1 hit point.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Healing',
      damage_type: null,
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 10,
      timing: 'Start of Turn',
    },
  ],
  slug: 'oni-regeneration',
});
