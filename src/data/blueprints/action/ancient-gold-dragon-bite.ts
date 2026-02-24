import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage.',
  type: 'melee',
  toHit: 17,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 15,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 10,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ancient-gold-dragon-bite',
});
