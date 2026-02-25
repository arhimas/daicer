import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The devil makes three attacks: two with its claws and one with its sting.',
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
  slug: 'bone-devil-multiattack',
});
