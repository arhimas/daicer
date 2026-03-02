import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Dancing Lights',
  description: 'The hag can innately cast dancing lights at will, requiring no material components.',
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'green-hag-dancing-lights',
});
