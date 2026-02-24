import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'aid',
  name: 'Aid',
  level: 2,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A tiny strip of white cloth.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 8,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Healing',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 5,
      timing: 'Instant',
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Per Slot Level',
  },
  description:
    "Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's hit point maximum and current hit points increase by 5 for the duration.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, a target's hit points increase by an additional 5 for each slot level above 2nd.",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped Aid spell from reference data.',
  },
  tags: ['cleric', 'paladin', 'buff'],
});
