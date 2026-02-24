import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Web Walker',
  description: 'The ettercap ignores movement restrictions caused by webbing.',
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
  slug: 'ettercap-web-walker',
});
