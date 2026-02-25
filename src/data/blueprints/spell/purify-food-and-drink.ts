import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'purify-food-and-drink',
  name: 'Purify Food and Drink',
  level: 1,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
    aoe_shape: 'Sphere',
    aoe_size: 5,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'All nonmagical food and drink within a 5-foot radius sphere centered on a point of your choice within range is purified and rendered free of poison and disease.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['cleric', 'druid', 'paladin', 'lore'],
});
