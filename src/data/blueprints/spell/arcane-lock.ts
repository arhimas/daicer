import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'arcane-lock',
  name: 'Arcane Lock',
  level: 2,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 25,
      material: true,
      material_description: 'Gold dust worth at least 25gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Until Dispelled',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'You touch a closed door, window, gate, chest, or other entryway, and it becomes locked for the duration. You and the creatures you designate when you cast this spell can open the object normally. You can also set a password that, when spoken within 5 feet of the object, suppresses this spell for 1 minute. Otherwise, it is impassable until it is broken or the spell is dispelled or suppressed. Casting knock on the object suppresses arcane lock for 10 minutes. While affected by this spell, the object is more difficult to break or force open; the DC to break it or pick any locks on it increases by 10.',
  compilation_state: {
    status: 'Valid',
  },
});
