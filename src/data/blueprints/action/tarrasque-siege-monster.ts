import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Siege Monster',
  description: 'The tarrasque deals double damage to objects and structures.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'tarrasque-siege-monster',
});
