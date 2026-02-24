import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'clothes-travelers',
  name: "Clothes, traveler's",
  description:
    'This set of clothes includes boots, a wool skirt or breeches, a belt, a shirt (often with a vest or jacket), and an ample hooded cloak.',
  type: 'loot',
  rarity: 'common',
  value: 2,
  weight: 4,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
});
