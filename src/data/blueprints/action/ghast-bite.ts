import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 12 (2d8 + 3) piercing damage.',
  type: 'melee',
  toHit: 3,
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
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ghast-bite',
});
