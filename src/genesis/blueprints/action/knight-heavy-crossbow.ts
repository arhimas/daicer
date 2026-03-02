import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Heavy Crossbow',
  description: 'Ranged Weapon Attack: +2 to hit, range 100/400 ft., one target. Hit: 5 (1d10) piercing damage.',
  type: 'ranged',
  toHit: 2,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 100,
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
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'knight-heavy-crossbow',
});
