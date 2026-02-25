import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Pseudopod',
  description:
    'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 9 (2d6 + 2) bludgeoning damage plus 3 (1d6) acid damage.',
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
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 2,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: null,
  slug: 'ochre-jelly-pseudopod',
});
