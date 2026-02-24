import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'misty-step',
  name: 'Misty Step',
  level: 2,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Bonus Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  tags: ['sorcerer', 'warlock', 'wizard', 'lore', 'land'],
});
