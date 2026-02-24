import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'blindness-deafness',
  name: 'Blindness/Deafness',
  level: 2,
  school: 'Necromancy',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Blinded',
      description: 'The target is either blinded or deafened (your choice) for the duration.',
      chance: 100,
    },
    {
      condition: 'Deafened',
      description: 'The target is either blinded or deafened (your choice) for the duration.',
      chance: 100,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Target',
    method: 'Per Slot Level',
  },
  description:
    'You can blind or deafen a foe. Choose one creature that you can see within range to make a constitution saving throw. If it fails, the target is either blinded or deafened (your choice) for the duration. At the end of each of its turns, the target can make a constitution saving throw. On a success, the spell ends. At Higher Levels: When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.',
  compilation_state: {
    status: 'Valid',
  },
});
