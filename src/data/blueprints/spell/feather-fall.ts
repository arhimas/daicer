import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'feather-fall',
  name: 'Feather Fall',
  level: 1,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Reaction',
    reaction_trigger: 'When you or a creature within 60 feet of you falls',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A small feather or a piece of down.',
      somatic: false,
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
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If the creature lands before the spell ends, it takes no falling damage and can land on its feet, and the spell ends for that creature.",
  compilation_state: {
    status: 'Valid',
    summary: 'Spell successfully mapped from reference data.',
  },
  tags: ['bard', 'sorcerer', 'wizard'],
});
