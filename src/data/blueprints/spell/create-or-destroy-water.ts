import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'create-or-destroy-water',
  name: 'Create or Destroy Water',
  level: 1,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A drop of water if creating water, or a few grains of sand if destroying it.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
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
    'You either create or destroy water.\n\n***Create Water.*** You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot cube within range.\n\n***Destroy Water.*** You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot cube within range.\n\n***At Higher Levels.*** When you cast this spell using a spell slot of 2nd level or higher, you create or destroy 10 additional gallons of water, or the size of the cube increases by 5 feet, for each slot level above 1st.',
  compilation_state: {
    status: 'Valid',
  },
});
