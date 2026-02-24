import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Claws',
  description:
    'Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 10 (2d4 + 5) slashing damage plus 10 (3d6) cold damage.',
  type: 'melee',
  toHit: 10,
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
      dice_count: 2,
      dice_value: 4,
      flat_bonus: 5,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Cold',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ice-devil-claws',
});
