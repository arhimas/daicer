import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Sight',
  description: 'The roc has advantage on Wisdom (Perception) checks that rely on sight.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'roc-keen-sight',
});
