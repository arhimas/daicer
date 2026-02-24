import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Frightful Presence',
  description:
    "Each creature of the tarrasque's choice within 120 feet of it and aware of it must succeed on a DC 17 Wisdom saving throw or become frightened for 1 minute.",
  type: 'ability',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: 'Sphere',
    aoe_size: 120,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 17,
    attribute: 'wis',
  },
  condition_instances: [
    {
      condition: 'Frightened',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'tarrasque-frightful-presence',
});
