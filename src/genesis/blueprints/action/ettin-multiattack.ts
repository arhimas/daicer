import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The ettin makes two attacks: one with its battleaxe and one with its morningstar.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'ettin-multiattack',
});
