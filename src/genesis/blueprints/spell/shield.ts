import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'shield',
  name: 'Shield',
  level: 1,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Reaction',
    reaction_trigger: 'which you take when you are hit by an attack or targeted by the magic missile spell',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Rounds',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
  compilation_state: {
    status: 'Valid',
    summary: 'Shield spell successfully mapped from reference data.',
  },
  tags: ['sorcerer', 'wizard', 'lore'],
});
