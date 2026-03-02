import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Hold Breath',
  description: 'The crocodile can hold its breath for 15 minutes.',
  type: 'utility',
  slug: 'crocodile-hold-breath',
});
