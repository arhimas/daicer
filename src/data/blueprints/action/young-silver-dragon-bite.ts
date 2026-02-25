import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage.',
  type: 'melee',
  toHit: 10,
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
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 6,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'young-silver-dragon-bite',
});
