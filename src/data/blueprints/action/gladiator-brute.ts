import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Brute',
  description:
    'A melee weapon deals one extra die of its damage when the gladiator hits with it (included in the attack).',
  type: 'ability',
  slug: 'gladiator-brute',
});
