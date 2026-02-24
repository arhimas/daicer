import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'conjure-animals',
  name: 'Conjure Animals',
  level: 3,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Hours',
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
    "You summon fey spirits that take the form of beasts and appear in unoccupied spaces that you can see within range. Choose one of the following options for what appears:\n- One beast of challenge rating 2 or lower\n- Two beasts of challenge rating 1 or lower\n- Four beasts of challenge rating 1/2 or lower\n- Eight beasts of challenge rating 1/4 or lower\n- Each beast is also considered fey, and it disappears when it drops to 0 hit points or when the spell ends.\nThe summoned creatures are friendly to you and your companions. Roll initiative for the summoned creatures as a group, which has its own turns. They obey any verbal commands that you issue to them (no action required by you). If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions.\nThe GM has the creatures' statistics.\n\n**At Higher Levels.** When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 5th-level slot, three times as many with a 7th-level.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['druid', 'ranger', 'lore'],
});
