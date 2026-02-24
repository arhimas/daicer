import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'awaken',
  name: 'Awaken',
  level: 5,
  school: 'Transmutation',
  casting_config: {
    time_value: 8,
    time_unit: 'Hour',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 1000,
      material: true,
      material_description: 'An agate worth at least 1,000 gp, which the spell consumes.',
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
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Charmed',
      description:
        'The awakened beast or plant is charmed by you for 30 days or until you or your companions do anything harmful to it.',
      chance: 100,
      duration_rounds: 432000,
    },
  ],
  description:
    "After spending the casting time tracing magical pathways within a precious gemstone, you touch a Huge or smaller beast or plant. The target must have either no Intelligence score or an Intelligence of 3 or less. The target gains an Intelligence of 10. The target also gains the ability to speak one language you know. If the target is a plant, it gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human's. Your GM chooses statistics appropriate for the awakened plant, such as the statistics for the awakened shrub or the awakened tree. The awakened beast or plant is charmed by you for 30 days or until you or your companions do anything harmful to it. When the charmed condition ends, the awakened creature chooses whether to remain friendly to you, based on how you treated it while it was charmed.",
  compilation_state: {
    status: 'Valid',
  },
});
