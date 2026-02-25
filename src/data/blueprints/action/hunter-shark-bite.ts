import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) piercing damage.',
  type: 'melee',
  toHit: 6,
  range_config: {
    type: 'Touch',
    distance: 5,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  slug: 'hunter-shark-bite',
});
