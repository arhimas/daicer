import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'barrel',
  name: 'Barrel',
  description: 'A barrel can hold 40 gallons of liquid or 4 cubic feet of solid material.',
  type: 'container',
  rarity: 'common',
  value: 2,
  weight: 70,
  size: 'Medium',
});
