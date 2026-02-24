import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Underwater Camouflage',
  description: 'The octopus has advantage on Dexterity (Stealth) checks made while underwater.',
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
  slug: 'giant-octopus-underwater-camouflage',
});
