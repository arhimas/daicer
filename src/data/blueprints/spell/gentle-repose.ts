import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'gentle-repose',
  name: 'Gentle Repose',
  level: 2,
  school: 'Necromancy',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description:
        "A pinch of salt and one copper piece placed on each of the corpse's eyes, which must remain there for the duration.",
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 10,
    unit: 'Days',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    "You touch a corpse or other remains. For the duration, the target is protected from decay and can't become undead.\n\nThe spell also effectively extends the time limit on raising the target from the dead, since days spent under the influence of this spell don't count against the time limit of spells such as raise dead.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['cleric', 'wizard', 'lore'],
});
