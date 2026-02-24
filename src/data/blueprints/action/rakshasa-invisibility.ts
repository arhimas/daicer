import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Invisibility',
  description: 'invisibility',
  type: 'spell',
  range_config: {
    type: 'Touch',
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'rakshasa-invisibility',
});
