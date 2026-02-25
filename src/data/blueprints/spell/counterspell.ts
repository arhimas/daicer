import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'counterspell',
  name: 'Counterspell',
  level: 3,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Reaction',
    reaction_trigger: 'which you take when you see a creature within 60 feet of you casting a spell',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: false,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  scaling_config: {
    scales: true,
    type: 'Target',
    method: 'Per Slot Level',
  },
  description:
    "You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a success, the creature's spell fails and has no effect.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the interrupted spell has no effect if its level is less than or equal to the level of the spell slot you used.",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
});
