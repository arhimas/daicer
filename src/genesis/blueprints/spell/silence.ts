import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'silence',
  name: 'Silence',
  level: 2,
  school: 'Illusion',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
    is_concentration: true,
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
    distance: 120,
    aoe_shape: 'Sphere',
    aoe_size: 20,
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
  condition_instances: [
    {
      condition: 'Deafened',
      description: 'Creatures are deafened while entirely inside the sphere.',
      chance: 100,
    },
  ],
  description:
    'For the duration, no sound can be created within or pass through a 20-foot-radius sphere centered on a point you choose within range. Any creature or object entirely inside the sphere is immune to thunder damage, and creatures are deafened while entirely inside it. Casting a spell that includes a verbal component is impossible there.',
  compilation_state: {
    status: 'Valid',
    summary: 'Spell compiled from reference data.',
  },
});
