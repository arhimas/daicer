import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'blur',
  name: 'Blur',
  level: 2,
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
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Attackers have disadvantage on attack rolls against you unless they have blindsight or truesight.',
      chance: 100,
    },
  ],
  description:
    "Your body becomes blurred, shifting and wavering to all who can see you. For the duration, any creature has disadvantage on attack rolls against you. An attacker is immune to this effect if it doesn't rely on sight, as with blindsight, or can see through illusions, as with truesight.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['sorcerer', 'wizard', 'lore', 'land'],
});
