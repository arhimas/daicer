import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Claws',
  description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage.',
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
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  slug: 'sea-hag-claws',
});
