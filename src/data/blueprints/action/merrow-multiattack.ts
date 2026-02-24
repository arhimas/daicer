import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The merrow makes two attacks: one with its bite and one with its claws or harpoon.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'merrow-multiattack',
});
