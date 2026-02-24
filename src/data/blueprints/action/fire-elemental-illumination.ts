import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Illumination',
  description: 'The elemental sheds bright light in a 30-foot radius and dim light in an additional 30 ft.',
  type: 'utility',
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 30,
  },
  slug: 'fire-elemental-illumination',
});
