import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Death Burst',
  description:
    'When the mephit dies, it explodes in a burst of lava. Each creature within 5 ft. of it must make a DC 11 Dexterity saving throw, taking 7 (2d6) fire damage on a failed save, or half as much damage on a successful one.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 5,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 11,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: null,
  slug: 'magma-mephit-death-burst',
});
