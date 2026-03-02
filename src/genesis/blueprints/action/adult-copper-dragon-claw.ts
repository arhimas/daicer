import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Claw',
  description: 'Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage.',
  type: 'melee',
  toHit: 11,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 5,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  slug: 'adult-copper-dragon-claw',
});
