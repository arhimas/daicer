import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail Attack',
  description: 'The dragon makes a tail attack.',
  type: 'melee',
  toHit: 16,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 20,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 9,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ancient-blue-dragon-tail-attack',
});
