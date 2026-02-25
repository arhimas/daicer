import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Tree Stride',
  description:
    'Once on her turn, the dryad can use 10 ft. of her movement to step magically into one living tree within her reach and emerge from a second living tree within 60 ft. of the first tree, appearing in an unoccupied space within 5 ft. of the second tree. Both trees must be large or bigger.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'dryad-tree-stride',
});
