import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Claw',
  description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) slashing damage.',
  type: 'melee',
  toHit: 4,
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
      dice_count: 1,
      dice_value: 4,
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  slug: 'panther-claw',
});
