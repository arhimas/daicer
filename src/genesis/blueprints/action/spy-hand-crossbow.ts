import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Hand Crossbow',
  description: 'Ranged Weapon Attack: +4 to hit, range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
  type: 'ranged',
  toHit: 4,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
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
      flat_bonus: 2,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'spy-hand-crossbow',
});
