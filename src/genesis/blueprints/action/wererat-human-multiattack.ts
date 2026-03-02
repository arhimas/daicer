import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The wererat makes two attacks, only one of which can be a bite.',
  type: 'utility',
  slug: 'wererat-human-multiattack',
});
