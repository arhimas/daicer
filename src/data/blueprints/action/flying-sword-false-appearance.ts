import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'False Appearance',
  description: "While the sword remains motionless and isn't flying, it is indistinguishable from a normal sword.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'flying-sword-false-appearance',
});
