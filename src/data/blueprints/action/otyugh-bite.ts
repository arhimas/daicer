import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 12 (2d8 + 3) piercing damage. If the target is a creature, it must succeed on a DC 15 Constitution saving throw against disease or become poisoned until the disease is cured. Every 24 hours that elapse, the target must repeat the saving throw, reducing its hit point maximum by 5 (1d10) on a failure. The disease is cured on a success. The target dies if the disease reduces its hit point maximum to 0. This reduction to the target's hit point maximum lasts until the disease is cured.",
  type: 'melee',
  toHit: 6,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: {
    dc: 15,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Poisoned',
      description: 'until the disease is cured',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Special',
      description:
        'Disease: Every 24 hours, the target must repeat a DC 15 Constitution saving throw. On a failure, its hit point maximum is reduced by 5 (1d10). The disease is cured on a success. The target dies if this disease reduces its hit point maximum to 0. This reduction lasts until the disease is cured.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'otyugh-bite',
});
