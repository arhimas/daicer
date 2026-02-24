import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Paralyzing Breath',
  description:
    'The dragon exhales paralyzing gas in a 30-foot cone. Each creature in that area must succeed on a DC 17 Constitution saving throw or be paralyzed for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Cone',
    aoe_size: 30,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 17,
    attribute: 'con',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Paralyzed',
      description:
        'A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'young-silver-dragon-paralyzing-breath',
});
