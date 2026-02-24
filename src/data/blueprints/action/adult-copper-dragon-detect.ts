import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Detect',
  description: 'The dragon makes a Wisdom (Perception) check.',
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'adult-copper-dragon-detect',
});
