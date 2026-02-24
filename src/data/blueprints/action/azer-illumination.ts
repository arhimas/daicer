import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Illumination',
  description: 'The azer sheds bright light in a 10-foot radius and dim light for an additional 10 ft..',
  type: 'utility',
  slug: 'azer-illumination',
});
