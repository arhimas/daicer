import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Claws',
  description: 'Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 13 (2d8 + 4) slashing damage.',
  type: 'melee',
  toHit: 6,
  range_config: {
    type: 'Touch',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 4,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'green-hag-claws',
});
