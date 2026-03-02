import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'thaumaturgy',
  name: 'Thaumaturgy',
  level: 0,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: false,
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
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'You manifest a minor wonder, a sign of supernatural power, within range. You create one of the following magical effects within range:\n\n- Your voice booms up to three times as loud as normal for 1 minute.\n- You cause flames to flicker, brighten, dim, or change color for 1 minute.\n- You cause harmless tremors in the ground for 1 minute.\n- You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers.\n- You instantaneously cause an unlocked door or window to fly open or slam shut.\n- You alter the appearance of your eyes for 1 minute.\n\nIf you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time, and you can dismiss such an effect as an action.',
  compilation_state: {
    status: 'Valid',
  },
});
