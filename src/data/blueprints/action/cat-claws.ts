import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Claws',
  description: 'Melee Weapon Attack: +0 to hit, reach 5 ft., one target. Hit: 1 slashing damage.',
  type: 'melee',
  toHit: 0,
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
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  slug: 'cat-claws',
});
