import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Water Breathing',
  description: 'The octopus can breathe only underwater.',
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
  slug: 'giant-octopus-water-breathing',
});
