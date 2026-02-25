import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The cloaker makes two attacks: one with its bite and one with its tail.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'cloaker-multiattack',
});
