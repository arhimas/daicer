import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tentacles',
  description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) slashing damage.',
  type: 'melee',
  toHit: 4,
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
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  slug: 'grick-tentacles',
});
