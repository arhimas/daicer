import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'fly',
  name: 'Fly',
  level: 3,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A wing feather from any bird.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Concentration',
    value: 10,
    unit: 'Minutes',
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
    'You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd.',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
  tags: ['sorcerer', 'warlock', 'wizard', 'lore'],
});
