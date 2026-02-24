import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Charge',
  description:
    'If the boar moves at least 20 ft. straight toward a target and then hits it with a tusk attack on the same turn, the target takes an extra 7 (2d6) slashing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone.',
  type: 'ability',
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
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: [
    {
      condition: 'Prone',
      chance: 100,
    },
  ],
  slug: 'giant-boar-charge',
});
