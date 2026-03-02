import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'inflict-wounds',
  name: 'Inflict Wounds',
  level: 1,
  school: 'Necromancy',
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
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Necrotic',
      dice_count: 3,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Per Slot Level',
    dice_count: 1,
    dice_value: 10,
  },
  description:
    'Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 necrotic damage.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.',
  compilation_state: {
    status: 'Valid',
  },
});
