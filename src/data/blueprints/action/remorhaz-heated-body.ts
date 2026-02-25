import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Heated Body',
  description:
    'A creature that touches the remorhaz or hits it with a melee attack while within 5 feet of it takes 10 (3d6) fire damage.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 5,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: null,
  slug: 'remorhaz-heated-body',
});
