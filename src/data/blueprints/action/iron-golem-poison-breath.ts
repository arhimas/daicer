import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Poison Breath',
  description:
    'The golem exhales poisonous gas in a 15-foot cone. Each creature in that area must make a DC 19 Constitution saving throw, taking 45 (10d8) poison damage on a failed save, or half as much damage on a successful one.',
  type: 'ability',
  range_config: {
    type: 'Ranged (Feet)',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 15,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  save: {
    dc: 19,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Poison',
      dice_count: 10,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'iron-golem-poison-breath',
});
