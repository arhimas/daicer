import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'chariot',
  name: 'Chariot',
  description:
    'Vehicle Category: Tack, Harness, and Drawn Vehicles. A chariot is a light, open, two-wheeled carriage, often used in ancient warfare and racing.',
  type: 'loot',
  rarity: 'common',
  value: 250,
  weight: 100,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
});
