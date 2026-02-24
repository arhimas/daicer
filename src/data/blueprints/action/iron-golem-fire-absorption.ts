import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Fire Absorption',
  description:
    'Whenever the golem is subjected to fire damage, it takes no damage and instead regains a number of hit points equal to the fire damage dealt.',
  type: 'ability',
  slug: 'iron-golem-fire-absorption',
});
