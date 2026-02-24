import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'hold-monster',
  name: 'Hold Monster',
  level: 5,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A small piece of iron.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 90,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Paralyzed',
      description: 'The target must make a saving throw of Wisdom or be paralyzed for the duration of the spell.',
      chance: 100,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Target',
    method: 'Per Slot Level',
  },
  description:
    'Choose a creature you can see and reach. The target must make a saving throw of Wisdom or be paralyzed for the duration of the spell. This spell has no effect against the undead. At the end of each round, the target can make a new saving throw of Wisdom. If successful, the spell ends for the creature.\n\n### At Higher Levels\nWhen you cast this spell using a level 6 or higher location, you can target an additional creature for each level of location beyond the fifth. The creatures must be within 30 feet of each other when you target them.',
  compilation_state: {
    status: 'Valid',
    summary: 'Spell successfully parsed from reference data.',
  },
});
