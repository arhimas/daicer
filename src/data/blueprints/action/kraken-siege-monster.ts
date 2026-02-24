import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Siege Monster',
  description: 'The kraken deals double damage to objects and structures.',
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
  slug: 'kraken-siege-monster',
});
