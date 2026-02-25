import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'feeblemind',
  name: 'Feeblemind',
  level: 8,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A handful of clay, crystal, glass, or mineral spheres.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 150,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Intelligence Save',
    save_effect: 'Negate',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Psychic',
      dice_count: 4,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description:
        "Intelligence and Charisma scores become 1. The creature can't cast spells, activate magic items, understand language, or communicate in any intelligible way.",
      chance: 100,
      duration_rounds: 432000,
    },
  ],
  description:
    "You blast the mind of a creature that you can see within range, attempting to shatter its intellect and personality. The target takes 4d6 psychic damage and must make an intelligence saving throw.\n\nOn a failed save, the creature's Intelligence and Charisma scores become 1. The creature can't cast spells, activate magic items, understand language, or communicate in any intelligible way. The creature can, however, identify its friends, follow them, and even protect them.\n\nAt the end of every 30 days, the creature can repeat its saving throw against this spell. If it succeeds on its saving throw, the spell ends.\n\nThe spell can also be ended by greater restoration, heal, or wish.",
  compilation_state: {
    status: 'Valid',
    summary: 'Spell successfully mapped from reference data.',
  },
  tags: ['bard', 'druid', 'warlock', 'wizard'],
});
