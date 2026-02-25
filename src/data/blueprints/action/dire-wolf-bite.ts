import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Bite',
  description:
    'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone.',
  type: 'melee',
  toHit: 5,
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
    dc: 13,
    attribute: 'str',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 3,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Prone',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'dire-wolf-bite',
});
