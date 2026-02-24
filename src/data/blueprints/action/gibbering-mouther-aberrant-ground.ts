import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Aberrant Ground',
  description:
    'The ground in a 10-foot radius around the mouther is doughlike difficult terrain. Each creature that starts its turn in that area must succeed on a DC 10 Strength saving throw or have its speed reduced to 0 until the start of its next turn.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: 10,
    aoe_shape: 'Sphere',
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 10,
    attribute: 'str',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'Speed reduced to 0',
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'gibbering-mouther-aberrant-ground',
});
