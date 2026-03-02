import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Invisibility',
  description: 'The archmage can cast invisibility at will.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'archmage-invisibility',
});
