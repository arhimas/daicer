import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 2 (1d6 - 1) slashing damage.',
  type: 'melee',
  toHit: 1,
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
      damage_type: 'Slashing',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: -1,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'giant-fire-beetle-bite',
});
