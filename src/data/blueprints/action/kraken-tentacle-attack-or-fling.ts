import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Tentacle Attack or Fling',
  description: 'The kraken makes one tentacle attack or uses its Fling.',
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
  slug: 'kraken-tentacle-attack-or-fling',
});
