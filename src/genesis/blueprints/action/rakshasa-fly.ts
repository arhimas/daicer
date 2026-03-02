import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Fly',
  description: 'fly',
  type: 'spell',
  range_config: {
    type: 'Touch',
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'rakshasa-fly',
});
