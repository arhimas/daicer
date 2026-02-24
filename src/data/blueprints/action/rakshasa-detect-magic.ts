import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Detect Magic',
  description: 'detect magic',
  type: 'spell',
  range_config: {
    type: 'Self',
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'rakshasa-detect-magic',
});
