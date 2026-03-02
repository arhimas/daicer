import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Limited Amphibiousness',
  description:
    'The sahuagin can breathe air and water, but it needs to be submerged at least once every 4 hours to avoid suffocating.',
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
  slug: 'sahuagin-limited-amphibiousness',
});
