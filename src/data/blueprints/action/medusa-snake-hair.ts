import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Snake Hair',
  description:
    'Melee Weapon Attack: +5 to hit, reach 5 ft., one creature. Hit: 4 (1d4 + 2) piercing damage plus 14 (4d6) poison damage.',
  type: 'melee',
  toHit: 5,
  range_config: {
    type: 'Touch',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
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
    {
      effect_type: 'Damage',
      damage_type: 'Poison',
      dice_count: 4,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'medusa-snake-hair',
});
