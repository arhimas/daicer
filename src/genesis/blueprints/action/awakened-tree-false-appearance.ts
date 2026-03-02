import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'False Appearance',
  description: 'While the tree remains motionless, it is indistinguishable from a normal tree.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'awakened-tree-false-appearance',
});
