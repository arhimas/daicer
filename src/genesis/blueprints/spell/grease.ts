import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'grease',
  name: 'Grease',
  level: 1,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A bit of pork rind or butter.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Prone',
      description:
        'A creature that enters the area or ends its turn there must succeed on a dexterity saving throw or fall prone.',
      chance: 100,
    },
  ],
  description:
    'Slick grease covers the ground in a 10-foot square centered on a point within range and turns it into difficult terrain for the duration. When the grease appears, each creature standing in its area must succeed on a dexterity saving throw or fall prone. A creature that enters the area or ends its turn there must also succeed on a dexterity saving throw or fall prone.',
  compilation_state: {
    status: 'Valid',
  },
});
