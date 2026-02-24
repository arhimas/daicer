import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Attack',
  description: 'The tarrasque makes one claw attack or tail attack.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'tarrasque-attack',
});
