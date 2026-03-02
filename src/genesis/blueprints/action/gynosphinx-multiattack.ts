import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The sphinx makes two claw attacks.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'gynosphinx-multiattack',
});
