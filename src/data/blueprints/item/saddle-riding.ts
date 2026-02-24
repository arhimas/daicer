import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'saddle-riding',
  name: 'Saddle, Riding',
  description: 'A standard saddle designed to provide a secure seat for a rider on a mount.',
  type: 'tool',
  rarity: 'common',
  value: 10,
  weight: 25,
  size: 'Medium',
  equipment_data: {
    properties: [],
  },
  tags: ['mounts-and-vehicles', 'tack-harness-and-drawn-vehicles'],
});
