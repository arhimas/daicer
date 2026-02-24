import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'expeditious-retreat',
  name: 'Expeditious Retreat',
  level: 1,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Bonus Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Concentration',
    value: 10,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'This spell allows you to move at an incredible pace. When you cast this spell, and then as a bonus action on each of your turns until the spell ends, you can take the Dash action.',
  compilation_state: {
    status: 'Valid',
  },
});
