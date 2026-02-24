import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Weakening Breath',
  description:
    'The dragon exhales gas in a 15-foot cone. Each creature in that area must succeed on a DC 13 Strength saving throw or have disadvantage on Strength-based attack rolls, Strength checks, and Strength saving throws for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. (Recharge 5-6)',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 15,
  },
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 13,
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
  slug: 'gold-dragon-wyrmling-weakening-breath',
});
