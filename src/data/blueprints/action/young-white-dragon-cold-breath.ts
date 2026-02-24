import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Cold Breath',
  description:
    'The dragon exhales an icy blast in a 30-foot cone. Each creature in that area must make a DC 15 Constitution saving throw, taking 45 (10d8) cold damage on a failed save, or half as much damage on a successful one.',
  type: 'ability',
  range_config: {
    type: 'Self',
    aoe_shape: 'Cone',
    aoe_size: 30,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 15,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Cold',
      dice_count: 10,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'young-white-dragon-cold-breath',
});
