import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Charge',
  description:
    'If the skeleton moves at least 10 feet straight toward a target and then hits it with a gore attack on the same turn, the target takes an extra 9 (2d8) piercing damage. If the target is a creature, it must succeed on a DC 14 Strength saving throw or be pushed up to 10 feet away and knocked prone.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'None',
  },
  save: {
    dc: 14,
    attribute: 'str',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Piercing',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: [
    {
      condition: 'Prone',
      description: 'Pushed up to 10 feet away and knocked prone on failed save.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'minotaur-skeleton-charge',
});
