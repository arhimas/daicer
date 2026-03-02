import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Frightful Presence',
  description:
    "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 19,
    attribute: 'wis',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Frightened',
      description: null,
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'ancient-copper-dragon-frightful-presence',
});
