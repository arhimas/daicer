import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The wereboar makes two attacks, only one of which can be with its tusks.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'wereboar-hybrid-multiattack',
});
