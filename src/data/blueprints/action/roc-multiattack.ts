import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The roc makes two attacks: one with its beak and one with its talons.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'roc-multiattack',
});
