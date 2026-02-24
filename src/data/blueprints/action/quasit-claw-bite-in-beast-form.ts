import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Claw (Bite in Beast Form)',
  description:
    'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d4 + 3) piercing damage, and the target must succeed on a DC 10 Constitution saving throw or take 5 (2d4) poison damage and become poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.',
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
  save: {
    dc: 10,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 4,
      flat_bonus: 3,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Poison',
      dice_count: 2,
      dice_value: 4,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Poisoned',
      description: null,
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'quasit-claw-bite-in-beast-form',
});
