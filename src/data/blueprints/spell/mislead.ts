import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'mislead',
  name: 'Mislead',
  level: 5,
  school: 'Illusion',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: false,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Hours',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Invisible',
      description: 'You become invisible. The invisibility ends if you attack or cast a spell.',
      chance: 100,
    },
    {
      condition: 'Blinded',
      description: "While you are using the double's senses, you are blinded in regard to your own surroundings.",
      chance: 100,
    },
    {
      condition: 'Deafened',
      description: "While you are using the double's senses, you are deafened in regard to your own surroundings.",
      chance: 100,
    },
  ],
  description:
    'You become invisible at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends if you attack or cast a spell.\n\nYou can use your action to move your illusory double up to twice your speed and make it gesture, speak, and behave in whatever way you choose.\n\nYou can see through its eyes and hear through its ears as if you were located where it is. On each of your turns as a bonus action, you can switch from using its senses to using your own, or back again. While you are using its senses, you are blinded and deafened in regard to your own surroundings.',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped Mislead from reference data.',
  },
  tags: ['bard', 'wizard'],
});
