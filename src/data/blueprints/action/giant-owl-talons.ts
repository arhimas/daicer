import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Talons',
  description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 8 (2d6 + 1) slashing damage.',
  type: 'melee',
  toHit: 3,
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
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  slug: 'giant-owl-talons',
});
