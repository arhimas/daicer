import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description: 'The sahuagin makes two melee attacks: one with its bite and one with its claws or spear.',
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
  slug: 'sahuagin-multiattack',
});
