import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Magic Resistance',
  description: 'The erinyes has advantage on saving throws against spells and other magical effects.',
  type: 'ability',
  slug: 'erinyes-magic-resistance',
});
