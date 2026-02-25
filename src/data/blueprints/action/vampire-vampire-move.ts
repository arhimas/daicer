import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Move',
  description: 'The vampire moves up to its speed without provoking opportunity attacks.',
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
  slug: 'vampire-vampire-move',
});
