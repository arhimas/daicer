import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Slowing Breath',
  description:
    "The dragon exhales gas in a 60-foot cone. Each creature in that area must succeed on a DC 18 Constitution saving throw. On a failed save, the creature can't use reactions, its speed is halved, and it can't make more than one attack on its turn. In addition, the creature can use either an action or a bonus action on its turn, but not both. These effects last for 1 minute. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself with a successful save. (Recharge 5-6)",
  type: 'ability',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: 'Cone',
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 18,
    attribute: 'con',
  },
  condition_instances: [
    {
      condition: 'Special',
      description:
        "Can't use reactions, speed is halved, can't make more than one attack, can use either an action or a bonus action but not both.",
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'adult-copper-dragon-slowing-breath',
});
