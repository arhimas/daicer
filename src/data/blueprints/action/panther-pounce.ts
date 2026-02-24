import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Pounce',
  description:
    'If the panther moves at least 20 ft. straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 12 Strength saving throw or be knocked prone. If the target is prone, the panther can make one bite attack against it as a bonus action.',
  type: 'ability',
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 12,
    attribute: 'str',
  },
  condition_instances: [
    {
      condition: 'Prone',
      chance: 100,
    },
  ],
  slug: 'panther-pounce',
});
