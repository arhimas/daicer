import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Spear (Melee)',
  description:
    'Melee or Ranged Weapon Attack: +3 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d6 + 1) piercing damage, or 5 (1d8 + 1) piercing damage if used with two hands to make a melee attack.',
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
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 1,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'tribal-warrior-spear-melee',
});
