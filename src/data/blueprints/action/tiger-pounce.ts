import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Pounce',
  description:
    'If the tiger moves at least 20 ft. straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 13 Strength saving throw or be knocked prone. If the target is prone, the tiger can make one bite attack against it as a bonus action.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 13,
    attribute: 'str',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Prone',
      description: null,
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'tiger-pounce',
});
