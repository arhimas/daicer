import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Heated Body',
  description:
    'A creature that touches the salamander or hits it with a melee attack while within 5 ft. of it takes 7 (2d6) fire damage.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
    save_effect: null,
  },
  save: null,
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
  slug: 'salamander-heated-body',
});
