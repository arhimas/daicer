import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Cone of Cold',
  description: '1/day spell: cone of cold',
  type: 'spell',
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 60,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 13,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Cold',
      dice_count: 8,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'oni-cone-of-cold',
});
