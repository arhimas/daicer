import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'False Appearance',
  description:
    'While the darkmantle remains motionless, it is indistinguishable from a cave formation such as a stalactite or stalagmite.',
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
  slug: 'darkmantle-false-appearance',
});
