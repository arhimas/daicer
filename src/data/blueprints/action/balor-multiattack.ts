import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The balor makes two attacks: one with its longsword and one with its whip.',
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
  slug: 'balor-multiattack',
});
