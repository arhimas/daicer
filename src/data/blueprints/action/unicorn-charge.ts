import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Charge',
  description:
    'If the unicorn moves at least 20 ft. straight toward a target and then hits it with a horn attack on the same turn, the target takes an extra 9 (2d8) piercing damage. If the target is a creature, it must succeed on a DC 15 Strength saving throw or be knocked prone.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 15,
    attribute: 'str',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 0,
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
  slug: 'unicorn-charge',
});
