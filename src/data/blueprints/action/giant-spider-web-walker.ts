import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Web Walker',
  description: 'The spider ignores movement restrictions caused by webbing.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'giant-spider-web-walker',
});
