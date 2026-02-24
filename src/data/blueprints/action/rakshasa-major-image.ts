import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Major Image',
  description: 'major image',
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'rakshasa-major-image',
});
