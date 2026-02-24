import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'remove-curse',
  name: 'Remove Curse',
  level: 3,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
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
    type: 'Touch',
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    "At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner's attunement to the object so it can be removed or discarded.",
  compilation_state: {
    status: 'Valid',
    summary: 'Spell compiled from reference data.',
  },
  tags: ['cleric', 'paladin', 'warlock', 'wizard', 'lore'],
});
