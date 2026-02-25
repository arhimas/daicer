import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Ethereal Sight',
  description: 'The ghost can see 60 ft. into the Ethereal Plane when it is on the Material Plane, and vice versa.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
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
  slug: 'ghost-ethereal-sight',
});
