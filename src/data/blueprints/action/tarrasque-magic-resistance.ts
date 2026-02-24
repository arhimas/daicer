import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Magic Resistance',
  description: 'The tarrasque has advantage on saving throws against spells and other magical effects.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'tarrasque-magic-resistance',
});
