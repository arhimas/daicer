import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The scout makes two melee attacks or two ranged attacks.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'scout-multiattack',
});
