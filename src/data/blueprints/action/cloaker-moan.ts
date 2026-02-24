import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Moan',
  description:
    "Each creature within 60 feet of the cloaker that can hear its moan and that isn't an aberration must succeed on a DC 13 Wisdom saving throw or become frightened until the end of the cloaker's next turn. If a creature's saving throw is successful, the creature is immune to the cloaker's moan for the next 24 hours.",
  type: 'ability',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: 'Sphere',
    aoe_size: 60,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 13,
    attribute: 'wis',
  },
  condition_instances: [
    {
      condition: 'Frightened',
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'cloaker-moan',
});
