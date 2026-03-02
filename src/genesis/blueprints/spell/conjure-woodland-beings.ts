import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'conjure-woodland-beings',
  name: 'Conjure Woodland Beings',
  level: 4,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'One holly berry per creature summoned.',
      somatic: true,
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
    concentration: true,
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
    "You summon fey creatures that appear in unoccupied spaces that you can see within range. Choose one of the following options for what appears: - One fey creature of challenge rating 2 or lower - Two fey creatures of challenge rating 1 or lower - Four fey creatures of challenge rating 1/2 or lower - Eight fey creatures of challenge rating 1/4 or lower. A summoned creature disappears when it drops to 0 hit points or when the spell ends. The summoned creatures are friendly to you and your companions. Roll initiative for the summoned creatures as a group, which have their own turns. They obey any verbal commands that you issue to them (no action required by you). If you don't issue any commands to them, they defend themselves from hostile creatures, but otherwise take no actions. The GM has the creatures' statistics. Higher Level: When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot.",
  compilation_state: {
    status: 'Valid',
  },
});
