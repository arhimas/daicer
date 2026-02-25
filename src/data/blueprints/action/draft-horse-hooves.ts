import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Hooves',
  description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 9 (2d4 + 4) bludgeoning damage.',
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
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 4,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  slug: 'draft-horse-hooves',
});
