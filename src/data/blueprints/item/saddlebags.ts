import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'saddlebags',
  name: 'Saddlebags',
  description: 'A pair of bags draped over the back of a mount, used for carrying gear and supplies.',
  type: 'container',
  rarity: 'common',
  value: 4,
  weight: 8,
  size: 'Medium',
  equipment_data: {
    properties: [],
  },
});
