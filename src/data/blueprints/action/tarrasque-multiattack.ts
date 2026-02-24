import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The tarrasque can use its Frightful Presence. It then makes five attacks: one with its bite, two with its claws, one with its horns, and one with its tail. It can use its Swallow instead of its bite.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'tarrasque-multiattack',
});
