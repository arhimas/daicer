import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +12 to hit, reach 10 ft., one target. Hit: 18 (2d10 + 7) piercing damage.',
  type: 'melee',
  toHit: 12,
  range_config: {
    type: 'Ranged (Feet)',
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
      flat_bonus: 7,
      timing: 'Instant',
    },
  ],
  slug: 'adult-bronze-dragon-bite',
});
