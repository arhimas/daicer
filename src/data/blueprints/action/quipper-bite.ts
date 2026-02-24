import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 1 piercing damage.',
  type: 'melee',
  toHit: 5,
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
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  slug: 'quipper-bite',
});
