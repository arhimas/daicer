import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Repulsion Breath',
  description:
    'The dragon exhales repulsion energy in a 30-foot cone. Each creature in that area must succeed on a DC 12 Strength saving throw. On a failed save, the creature is pushed 30 feet away from the dragon.',
  type: 'ranged',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
    aoe_shape: 'Cone',
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: null,
  },
  save: {
    dc: 12,
    attribute: 'str',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'Pushed 30 feet away from the dragon',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'bronze-dragon-wyrmling-repulsion-breath',
});
