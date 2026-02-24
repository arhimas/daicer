import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Darkness',
  description: 'At will spell: darkness',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
    aoe_shape: 'Sphere',
    aoe_size: 15,
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'oni-darkness',
});
