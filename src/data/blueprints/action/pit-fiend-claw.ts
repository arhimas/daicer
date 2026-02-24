import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Claw',
  description: 'Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 17 (2d8 + 8) slashing damage.',
  type: 'melee',
  toHit: 14,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 8,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'pit-fiend-claw',
});
