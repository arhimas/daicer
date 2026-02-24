import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'False Appearance',
  description: 'While the mephit remains motionless, it is indistinguishable from an ordinary mound of magma.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'magma-mephit-false-appearance',
});
