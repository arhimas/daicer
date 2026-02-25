import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Charge (Boar or Hybrid Form Only)',
  description:
    'If the wereboar moves at least 15 feet straight toward a target and then hits it with its tusks on the same turn, the target takes an extra 7 (2d6) slashing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'None',
  },
  save: {
    dc: 13,
    attribute: 'str',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Slashing',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Prone',
      description: 'Target is knocked prone on a failed DC 13 Strength save.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'wereboar-boar-charge-boar-or-hybrid-form-only',
});
