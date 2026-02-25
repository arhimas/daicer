import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Etherealness',
  description: 'The fiend magically enters the Ethereal Plane from the Material Plane, or vice versa.',
  type: 'utility',
  toHit: null,
  range_config: {
    type: 'Self',
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
  slug: 'succubus-incubus-etherealness',
});
