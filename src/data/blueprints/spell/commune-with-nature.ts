import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'commune-with-nature',
  name: 'Commune With Nature',
  level: 5,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
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
    "You briefly become one with nature and gain knowledge of the surrounding territory. In the outdoors, the spell gives you knowledge of the land within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. The spell doesn't function where nature has been replaced by construction, such as in dungeons and towns.\n\nYou instantly gain knowledge of up to three facts of your choice about any of the following subjects as they relate to the area:\n- terrain and bodies of water\n- prevalent plants, minerals, animals, or peoples\n- powerful celestials, fey, fiends, elementals, or undead\n- influence from other planes of existence\n- buildings\n\nFor example, you could determine the location of powerful undead in the area, the location of major sources of safe drinking water, and the location of any nearby towns.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['druid', 'ranger', 'land'],
});
