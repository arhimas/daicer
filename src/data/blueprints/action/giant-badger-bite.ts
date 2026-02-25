import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage.',
  type: 'melee',
  toHit: 3,
  range_config: {
    type: 'Ranged (Feet)',
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
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'giant-badger-bite',
});
