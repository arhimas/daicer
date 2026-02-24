import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Trampling Charge',
  description:
    'If the horse moves at least 20 ft. straight toward a creature and then hits it with a hooves attack on the same turn, that target must succeed on a DC 14 Strength saving throw or be knocked prone. If the target is prone, the horse can make another attack with its hooves against it as a bonus action.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 14,
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
  slug: 'warhorse-trampling-charge',
});
