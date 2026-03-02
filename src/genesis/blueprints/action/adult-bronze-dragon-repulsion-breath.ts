import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Repulsion Breath',
  description:
    'The dragon exhales repulsion energy in a 30-foot cone. Each creature in that area must succeed on a DC 19 Strength saving throw. On a failed save, the creature is pushed 60 feet away from the dragon.',
  type: 'ability',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
    aoe_shape: 'Cone',
  },
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 19,
    attribute: 'str',
  },
  condition_instances: [
    {
      condition: 'Special',
      description: 'Pushed 60 feet away from the dragon',
      chance: 100,
    },
  ],
  slug: 'adult-bronze-dragon-repulsion-breath',
});
