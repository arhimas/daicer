import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The gladiator makes three melee attacks or two ranged attacks.',
  type: 'utility',
  slug: 'gladiator-multiattack',
});
