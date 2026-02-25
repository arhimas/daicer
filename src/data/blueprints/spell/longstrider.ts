import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'longstrider',
  name: 'Longstrider',
  level: 1,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A pinch of dirt.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
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
  scaling_config: {
    scales: true,
    type: 'Target',
    method: 'Per Slot Level',
  },
  description:
    "You touch a creature. The target's speed increases by 10 feet until the spell ends.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each spell slot above 1st.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['Bard', 'Druid', 'Ranger', 'Wizard'],
});
