import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Water Breathing',
  description: 'The sea horse can breathe only underwater.',
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
  slug: 'giant-sea-horse-water-breathing',
});
