import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Wakeful',
  description: 'While the hydra sleeps, at least one of its heads is awake.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'hydra-wakeful',
});
