import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'bucket',
  name: 'Bucket',
  description: 'A bucket can hold 3 gallons of liquid or 1/2 cubic foot of solid material.',
  type: 'container',
  rarity: 'common',
  value: 5,
  weight: 2,
  size: 'Medium',
});
