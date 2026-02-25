import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Hurl Flame',
  description: 'Ranged Spell Attack: +7 to hit, range 120 ft., one target. Hit: 17 (5d6) fire damage.',
  type: 'spell',
  toHit: 7,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Ranged Spell Attack',
    save_effect: null,
  },
  save: null,
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 5,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'efreeti-hurl-flame',
});
