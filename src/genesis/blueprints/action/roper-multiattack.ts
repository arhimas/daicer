import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The roper makes four attacks with its tendrils, uses Reel, and makes one attack with its bite.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'roper-multiattack',
});
