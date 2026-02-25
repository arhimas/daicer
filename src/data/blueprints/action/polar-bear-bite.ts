import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 9 (1d8 + 5) piercing damage.',
  type: 'melee',
  toHit: 7,
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
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 5,
      timing: 'Instant',
    },
  ],
  slug: 'polar-bear-bite',
});
