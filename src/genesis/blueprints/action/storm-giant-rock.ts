import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Rock',
  description: 'Ranged Weapon Attack: +14 to hit, range 60/240 ft., one target. Hit: 35 (4d12 + 9) bludgeoning damage.',
  type: 'ranged',
  toHit: 14,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 240,
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
      damage_type: 'Bludgeoning',
      dice_count: 4,
      dice_value: 12,
      flat_bonus: 9,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'storm-giant-rock',
});
