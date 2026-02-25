import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +6 to hit, reach 10 ft., one creature. Hit: 11 (2d6 + 4) piercing damage.',
  type: 'melee',
  toHit: 6,
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
      dice_value: 6,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'giant-constrictor-snake-bite',
});
