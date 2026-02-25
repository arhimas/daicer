import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'conjure-elemental',
  name: 'Conjure Elemental',
  level: 5,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description:
        'Burning incense for air, soft clay for earth, sulfur and phosphorus for fire, or water and sand for water.',
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
    "You call forth an elemental servant. Choose an area of air, earth, fire, or water that fills a 10-foot cube within range. An elemental of challenge rating 5 or lower appropriate to the area you chose appears in an unoccupied space within 10 feet of it. For example, a fire elemental emerges from a bonfire, and an earth elemental rises up from the ground. The elemental disappears when it drops to 0 hit points or when the spell ends.\n\nThe elemental is friendly to you and your companions for the duration. Roll initiative for the elemental, which has its own turns. It obeys any verbal commands that you issue to it (no action required by you). If you don't issue any commands to the elemental, it defends itself from hostile creatures but otherwise takes no actions.\n\nIf your concentration is broken, the elemental doesn't disappear. Instead, you lose control of the elemental, it becomes hostile toward you and your companions, and it might attack. An uncontrolled elemental can't be dismissed by you, and it disappears 1 hour after you summoned it.\n\nThe GM has the elemental's statistics.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the challenge rating increases by 1 for each slot level above 5th.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['Druid', 'Wizard', 'Land'],
});
