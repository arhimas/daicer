import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Grappler',
  description: 'The mimic has advantage on attack rolls against any creature grappled by it.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'mimic-grappler',
});
