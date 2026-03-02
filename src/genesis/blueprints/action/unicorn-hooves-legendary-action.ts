import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Hooves (Legendary Action)',
  description: 'The unicorn makes one attack with its hooves.',
  type: 'melee',
  toHit: 7,
  range_config: {
    type: 'Touch',
    distance: 5,
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
      dice_value: 6,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'unicorn-hooves-legendary-action',
});
