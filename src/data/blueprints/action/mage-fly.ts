import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'fly',
  description:
    'You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'Target gains a flying speed of 60 feet.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'mage-fly',
});
