import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'stoneskin',
  name: 'Stoneskin',
  level: 4,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: true,
      cost_gp: 100,
      material: true,
      material_description: 'Diamond dust worth 100 gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
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
  damage_instances: [],
  condition_instances: [],
  scaling_config: {
    scales: false,
    type: 'Dice',
    method: 'Per Slot Level',
  },
  description:
    'This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage.',
  compilation_state: {
    status: 'Valid',
  },
});
