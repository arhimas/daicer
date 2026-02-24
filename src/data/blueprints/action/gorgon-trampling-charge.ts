import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Trampling Charge',
  description:
    'If the gorgon moves at least 20 feet straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 16 Strength saving throw or be knocked prone. If the target is prone, the gorgon can make one attack with its hooves against it as a bonus action.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 16,
    attribute: 'str',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Prone',
      description: 'Target is knocked prone on a failed save.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'gorgon-trampling-charge',
});
