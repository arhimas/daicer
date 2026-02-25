import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Amphibious',
  description: 'The hag can breathe air and water.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'green-hag-amphibious',
});
