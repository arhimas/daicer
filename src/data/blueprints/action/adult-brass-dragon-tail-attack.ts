import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail Attack',
  description: 'The dragon makes a tail attack.',
  type: 'melee',
  toHit: 11,
  range_config: {
    type: 'Touch',
    distance: 15,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  slug: 'adult-brass-dragon-tail-attack',
});
