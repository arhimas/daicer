import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Illumination',
  description: 'The beetle sheds bright light in a 10-foot radius and dim light for an additional 10 ft..',
  type: 'utility',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 20,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'giant-fire-beetle-illumination',
});
