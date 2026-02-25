import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'phantasmal-killer',
  name: 'Phantasmal Killer',
  level: 4,
  school: 'Illusion',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      material_description: '',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
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
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Psychic',
      dice_count: 4,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Frightened',
      description: 'On a failed save, the target becomes frightened for the duration.',
      chance: 100,
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
    "You tap into the nightmares of a creature you can see within range and create an illusory manifestation of its deepest fears, visible only to that creature. The target must make a wisdom saving throw. On a failed save, the target becomes frightened for the duration. At the start of each of the target's turns before the spell ends, the target must succeed on a wisdom saving throw or take 4d10 psychic damage. On a successful save, the spell ends.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th.",
  compilation_state: {
    status: 'Valid',
  },
});
