import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Shimmering Shield',
  description:
    "The unicorn creates a shimmering, magical field around itself or another creature it can see within 60 ft. of it. The target gains a +2 bonus to AC until the end of the unicorn's next turn.",
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
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
      description: 'Target gains a +2 bonus to AC',
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'unicorn-shimmering-shield',
});
