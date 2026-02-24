import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Cunning Action',
  description: 'On each of its turns, the spy can use a bonus action to take the Dash, Disengage, or Hide action.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'spy-cunning-action',
});
