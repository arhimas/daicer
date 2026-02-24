import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: "Devil's Sight",
  description: "Magical darkness doesn't impede the devil's darkvision.",
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
  slug: 'barbed-devil-devil-s-sight',
});
