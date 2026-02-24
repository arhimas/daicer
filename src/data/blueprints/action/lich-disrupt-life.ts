import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Disrupt Life',
  description:
    'Each living creature within 20 feet of the lich must make a DC 18 Constitution saving throw against this magic, taking 21 (6d6) necrotic damage on a failed save, or half as much damage on a successful one.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 20,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 18,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Necrotic',
      dice_count: 6,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'lich-disrupt-life',
});
