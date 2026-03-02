import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Beak',
  description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 4) piercing damage.',
  type: 'melee',
  toHit: 6,
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
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  slug: 'griffon-beak',
});
