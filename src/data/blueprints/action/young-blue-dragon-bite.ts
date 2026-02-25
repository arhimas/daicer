import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    'Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 16 (2d10 + 5) piercing damage plus 5 (1d10) lightning damage.',
  type: 'melee',
  toHit: 9,
  range_config: {
    type: 'Touch',
    distance: 10,
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
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 5,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Lightning',
      dice_count: 1,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'young-blue-dragon-bite',
});
