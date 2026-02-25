import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Slow',
  description:
    "The golem targets one or more creatures it can see within 10 ft. of it. Each target must make a DC 17 Wisdom saving throw against this magic. On a failed save, a target can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the target can take either an action or a bonus action on its turn, not both. These effects last for 1 minute. A target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.",
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 17,
    attribute: 'wis',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description:
        "can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the target can take either an action or a bonus action on its turn, not both. A target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.",
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'stone-golem-slow',
});
