import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'transport-via-plants',
  name: 'Transport via Plants',
  level: 6,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Rounds',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['druid'],
});
