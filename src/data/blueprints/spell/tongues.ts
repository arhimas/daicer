import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'tongues',
  name: 'Tongues',
  level: 3,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A small clay model of a ziggurat.',
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'This spell grants the creature you touch the ability to understand any spoken language it hears. Moreover, when the target speaks, any creature that knows at least one language and can hear the target understands what it says.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['bard', 'cleric', 'sorcerer', 'warlock', 'wizard', 'lore'],
});
