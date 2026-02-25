import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Beak',
  description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage.',
  type: 'melee',
  toHit: 4,
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
      dice_count: 1,
      dice_value: 4,
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'blood-hawk-beak',
});
