import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'elephant',
  name: 'Elephant',
  description:
    'A massive mount or beast of burden. Vehicle Category: Mounts and Other Animals. Speed: 40 ft/round. Capacity: 1,320 lb.',
  lore: 'Elephants are massive, intelligent creatures often used as powerful mounts or beasts of burden in war and industry.',
  type: 'loot',
  rarity: 'common',
  value: 200,
  weight: 0,
  size: 'Huge',
  tags: ['mount', 'vehicle'],
});
