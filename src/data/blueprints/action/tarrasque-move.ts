import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Move',
  description: 'The tarrasque moves up to half its speed.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'tarrasque-move',
});
