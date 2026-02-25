import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Tail Stinger',
  description:
    'Melee Weapon Attack: +9 to hit, reach 10 ft., one creature. Hit: 19 (3d6 + 9) piercing damage, and the target must make a DC 19 Constitution saving throw, taking 42 (12d6) poison damage on a failed save, or half as much damage on a successful one.',
  type: 'melee',
  toHit: 9,
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
  save: {
    dc: 19,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 9,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Poison',
      dice_count: 12,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'purple-worm-tail-stinger',
});
