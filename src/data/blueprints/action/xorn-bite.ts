import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (3d6 + 3) piercing damage.',
  type: 'melee',
  toHit: 6,
  range_config: {
    type: 'Touch',
    distance: 5,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  slug: 'xorn-bite',
});
