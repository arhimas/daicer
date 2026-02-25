import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Pseudopod',
  description:
    'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage plus 7 (2d6) acid damage, and if the target is wearing nonmagical metal armor, its armor is partly corroded and takes a permanent and cumulative -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10.',
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
      damage_type: 'Bludgeoning',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 1,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description:
        'If the target is wearing nonmagical metal armor, its armor is partly corroded and takes a permanent and cumulative -1 penalty to the AC it offers. The armor is destroyed if the penalty reduces its AC to 10.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'gray-ooze-pseudopod',
});
