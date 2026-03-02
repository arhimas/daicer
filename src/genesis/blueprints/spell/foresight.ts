import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'foresight',
  name: 'Foresight',
  level: 9,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A hummingbird feather.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 8,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target can't be surprised and has advantage on attack rolls, ability checks, and saving throws. Additionally, other creatures have disadvantage on attack rolls against the target for the duration.\n\nThis spell immediately ends if you cast it again before its duration ends.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['bard', 'druid', 'warlock', 'wizard'],
});
