import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Invisibility',
  description: 'At will spell: invisibility',
  type: 'spell',
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'oni-invisibility',
});
