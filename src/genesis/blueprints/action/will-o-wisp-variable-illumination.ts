import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Variable Illumination',
  description:
    "The will-o'-wisp sheds bright light in a 5- to 20-foot radius and dim light for an additional number of ft. equal to the chosen radius. The will-o'-wisp can alter the radius as a bonus action.",
  type: 'utility',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 20,
  },
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'will-o-wisp-variable-illumination',
});
