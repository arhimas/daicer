import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'water-breathing',
  name: 'Water Breathing',
  level: 3,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A short piece of reed or straw.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 24,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'This spell gives a maximum of ten willing creatures within range and you can see, the ability to breathe underwater until the end of its term. Affected creatures also retain their normal breathing pattern.',
  compilation_state: {
    status: 'Valid',
  },
});
