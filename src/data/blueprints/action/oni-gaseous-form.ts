import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Gaseous Form',
  description: '1/day spell: gaseous form',
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
  slug: 'oni-gaseous-form',
});
