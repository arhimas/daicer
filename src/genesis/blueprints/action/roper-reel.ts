import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Reel',
  description: 'The roper pulls each creature grappled by it up to 25 ft. straight toward it.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'roper-reel',
});
