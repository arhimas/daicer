import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The planetar makes two melee attacks.',
  type: 'utility',
  slug: 'planetar-multiattack',
});
