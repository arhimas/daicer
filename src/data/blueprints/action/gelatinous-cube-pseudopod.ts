import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Pseudopod',
  description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 10 (3d6) acid damage.',
  type: 'melee',
  toHit: 4,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 5,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  slug: 'gelatinous-cube-pseudopod',
});
