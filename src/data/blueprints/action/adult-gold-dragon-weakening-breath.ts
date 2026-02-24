import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Weakening Breath',
  description:
    'The dragon exhales gas in a 60-foot cone. Each creature in that area must succeed on a DC 21 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. (Recharge 5-6)',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 60,
  },
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 21,
    attribute: 'str',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'Disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'adult-gold-dragon-weakening-breath',
});
