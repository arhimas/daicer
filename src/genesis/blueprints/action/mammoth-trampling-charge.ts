import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Trampling Charge',
  description:
    'If the mammoth moves at least 20 ft. straight toward a creature and then hits it with a gore attack on the same turn, that target must succeed on a DC 18 Strength saving throw or be knocked prone. If the target is prone, the mammoth can make one stomp attack against it as a bonus action.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: null,
  },
  save: {
    dc: 18,
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
  slug: 'mammoth-trampling-charge',
});
