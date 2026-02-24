import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Water Breathing',
  description: 'The shark can breathe only underwater.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'giant-shark-water-breathing',
});
