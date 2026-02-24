import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'greater-invisibility',
  name: 'Greater Invisibility',
  level: 4,
  school: 'Illusion',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      material: false,
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
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Invisible',
      description: 'The target is invisible for the duration.',
      chance: 100,
    },
  ],
  description:
    "You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person.",
  compilation_state: {
    status: 'Valid',
  },
});
