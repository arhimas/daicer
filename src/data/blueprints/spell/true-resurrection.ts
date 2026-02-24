import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'true-resurrection',
  name: 'True Resurrection',
  level: 9,
  school: 'Necromancy',
  casting_config: {
    time_value: 1,
    time_unit: 'Hour',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 25000,
      material: true,
      material_description: 'A sprinkle of holy water and diamonds worth at least 25,000gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. If the creature's soul is free and willing, the creature is restored to life with all its hit points. This spell closes all wounds, neutralizes any poison, cures all diseases, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs. The spell can even provide a new body if the original no longer exists, in which case you must speak the creature's name. The creature then appears in an unoccupied space you choose within 10 feet of you.",
  compilation_state: {
    status: 'Valid',
  },
});
