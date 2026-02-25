import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'speak-with-animals',
  name: 'Speak with Animals',
  level: 1,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
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
    type: 'Self',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 10,
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    "You gain the ability to comprehend and verbally communicate with beasts for the duration. The knowledge and awareness of many beasts is limited by their intelligence, but at a minimum, beasts can give you information about nearby locations and monsters, including whatever they can perceive or have perceived within the past day. You might be able to persuade a beast to perform a small favor for you, at the GM's discretion.",
  compilation_state: {
    status: 'Valid',
  },
});
