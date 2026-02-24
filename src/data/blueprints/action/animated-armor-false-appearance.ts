import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'False Appearance',
  description: 'While the armor remains motionless, it is indistinguishable from a normal suit of armor.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'animated-armor-false-appearance',
});
