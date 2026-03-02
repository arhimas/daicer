import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The fanatic makes two melee attacks.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'cult-fanatic-multiattack',
});
