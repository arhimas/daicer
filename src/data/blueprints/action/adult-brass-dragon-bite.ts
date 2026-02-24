import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage.',
  type: 'melee',
  toHit: 11,
  range_config: {
    type: 'Touch',
    distance: 10,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  slug: 'adult-brass-dragon-bite',
});
