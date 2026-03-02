import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Spider Climb',
  description:
    'The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'giant-spider-spider-climb',
});
