import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The bear makes two attacks: one with its bite and one with its claws.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'polar-bear-multiattack',
});
