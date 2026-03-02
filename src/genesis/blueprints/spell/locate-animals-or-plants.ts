import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'locate-animals-or-plants',
  name: 'Locate Animals or Plants',
  level: 2,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A bit of fur from a bloodhound.',
      somatic: true,
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
    'Describe or name a specific kind of beast or plant. Concentrating on the voice of nature in your surroundings, you learn the direction and distance to the closest creature or plant of that kind within 5 miles, if any are present.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['Bard', 'Druid', 'Ranger'],
});
