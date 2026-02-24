import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Claw',
  description: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage.',
  type: 'melee',
  toHit: 5,
  range_config: {
    type: 'Touch',
    distance: 5,
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
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'lion-claw',
});
