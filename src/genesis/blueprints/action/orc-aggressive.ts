import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Aggressive',
  description: 'As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.',
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
  slug: 'orc-aggressive',
});
