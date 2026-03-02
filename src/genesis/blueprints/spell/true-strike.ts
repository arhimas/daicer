import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'true-strike',
  name: 'True Strike',
  level: 0,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      material_description: '',
      somatic: true,
      verbal: false,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Rounds',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    "You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target's defenses. On your next turn, you gain advantage on your first attack roll against the target, provided that this spell hasn't ended.",
  compilation_state: {
    status: 'Valid',
  },
});
