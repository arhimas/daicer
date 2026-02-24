import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Amorphous',
  description: 'The pudding can move through a space as narrow as 1 inch wide without squeezing.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'black-pudding-amorphous',
});
