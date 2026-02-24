import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Amphibious',
  description: 'The merrow can breathe air and water.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'merrow-amphibious',
});
