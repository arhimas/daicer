import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Keen Sight',
  description: 'The eagle has advantage on Wisdom (Perception) checks that rely on sight.',
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
  slug: 'giant-eagle-keen-sight',
});
