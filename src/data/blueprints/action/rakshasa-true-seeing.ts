import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'True Seeing',
  description: 'true seeing',
  type: 'spell',
  range_config: {
    type: 'Touch',
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'rakshasa-true-seeing',
});
