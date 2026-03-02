import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'sending',
  name: 'Sending',
  level: 3,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A short piece of fine copper wire.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Unlimited',
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
    "You send a short message of twenty-five words or less to a creature with which you are familiar. The creature hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. The spell enables creatures with Intelligence scores of at least 1 to understand the meaning of your message. You can send the message across any distance and even to other planes of existence, but if the target is on a different plane than you, there is a 5 percent chance that the message doesn't arrive.",
  compilation_state: {
    status: 'Valid',
  },
});
