import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Chomp',
  description: 'The tarrasque makes one bite attack or uses its Swallow.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'tarrasque-chomp',
});
