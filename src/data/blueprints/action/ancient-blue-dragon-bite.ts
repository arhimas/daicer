import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    'Melee Weapon Attack: +16 to hit, reach 15 ft., one target. Hit: 20 (2d10 + 9) piercing damage plus 11 (2d10) lightning damage.',
  type: 'melee',
  toHit: 16,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 15,
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
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 9,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Lightning',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ancient-blue-dragon-bite',
});
