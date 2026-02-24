import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The lizardfolk makes two melee attacks, each one with a different weapon.',
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
  slug: 'lizardfolk-multiattack',
});
