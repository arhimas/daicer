import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    'Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 3 (1d4 + 1) piercing damage, and the target must succeed on a DC 11 Constitution saving throw against being magically petrified. On a failed save, the creature begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified for 24 hours.',
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
  save: {
    dc: 11,
    attribute: 'con',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 1,
      dice_value: 4,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Restrained',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Petrified',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'cockatrice-bite',
});
