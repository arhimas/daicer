import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Detect',
  description: 'The dragon makes a Wisdom (Perception) check.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'ancient-copper-dragon-detect',
});
