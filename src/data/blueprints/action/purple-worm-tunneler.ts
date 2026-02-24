import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tunneler',
  description:
    'The worm can burrow through solid rock at half its burrow speed and leaves a 10-foot-diameter tunnel in its wake.',
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
  slug: 'purple-worm-tunneler',
});
