import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The treant makes two slam attacks.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'treant-multiattack',
});
