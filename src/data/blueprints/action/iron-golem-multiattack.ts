import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The golem makes two melee attacks.',
  type: 'utility',
  slug: 'iron-golem-multiattack',
});
