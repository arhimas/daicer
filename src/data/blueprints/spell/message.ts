import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'message',
  name: 'Message',
  level: 0,
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
      material_description: 'A short piece of copper wire.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
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
    "You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear.\\n\\nYou can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence, 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood blocks the spell. The spell doesn't have to follow a straight line and can travel freely around corners or through openings.",
  compilation_state: {
    status: 'Valid',
  },
});
