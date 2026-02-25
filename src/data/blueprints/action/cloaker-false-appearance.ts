import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'False Appearance',
  description:
    'While the cloaker remains motionless without its underside exposed, it is indistinguishable from a dark leather cloak.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'cloaker-false-appearance',
});
