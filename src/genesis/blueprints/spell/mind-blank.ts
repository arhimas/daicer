import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'mind-blank',
  name: 'Mind Blank',
  level: 8,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 24,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Charmed',
      description: 'The target is immune to the charmed condition for the duration.',
      chance: 100,
    },
  ],
  description:
    "Until the spell ends, one willing creature you touch is immune to psychic damage, any effect that would sense its emotions or read its thoughts, divination spells, and the charmed condition. The spell even foils wish spells and spells or effects of similar power used to affect the target's mind or to gain information about the target.",
  compilation_state: {
    status: 'Valid',
    summary: 'Spell successfully mapped from reference data.',
  },
  tags: ['bard', 'wizard'],
});
