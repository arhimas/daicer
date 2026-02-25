import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'telepathic-bond',
  name: 'Telepathic Bond',
  level: 5,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'Pieces of eggshell from two different kinds of creatures',
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
    value: 1,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    "You forge a telepathic link among up to eight willing creatures of your choice within range, psychically linking each creature to all the others for the duration. Creatures with Intelligence scores of 2 or less aren't affected by this spell.\n\nUntil the spell ends, the targets can communicate telepathically through the bond whether or not they have a common language. The communication is possible over any distance, though it can't extend to other planes of existence.",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  tags: ['wizard'],
});
