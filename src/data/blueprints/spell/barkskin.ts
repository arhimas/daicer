import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'barkskin',
  name: 'Barkskin',
  level: 2,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A handful of oak bark.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Hours',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [],
  scaling_config: {
    scales: false,
    type: 'Dice',
    method: 'Per Slot Level',
  },
  description:
    "You touch a willing creature. Until the spell ends, the target's skin has a rough, bark-like appearance, and the target's AC can't be less than 16, regardless of what kind of armor it is wearing.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['druid', 'ranger'],
});
