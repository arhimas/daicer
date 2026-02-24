import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Weakening Breath',
  description:
    'The dragon exhales gas in a 90-foot cone. Each creature in that area must succeed on a DC 24 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 90,
  },
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 24,
    attribute: 'str',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'ancient-gold-dragon-weakening-breath',
});
