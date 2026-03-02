import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Hold Breath',
  description: 'The whale can hold its breath for 30 minutes',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'killer-whale-hold-breath',
});
