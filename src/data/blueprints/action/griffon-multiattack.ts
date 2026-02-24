import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The griffon makes two attacks: one with its beak and one with its claws.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'griffon-multiattack',
});
