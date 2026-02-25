import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Amphibious',
  description: 'The dragon can breathe air and water.',
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
  slug: 'young-black-dragon-amphibious',
});
