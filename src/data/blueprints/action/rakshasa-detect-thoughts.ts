import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Detect Thoughts',
  description: 'detect thoughts',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'rakshasa-detect-thoughts',
});
