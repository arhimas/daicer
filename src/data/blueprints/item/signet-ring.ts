import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'signet-ring',
  name: 'Signet ring',
  description:
    'Each signet ring is an item of jewelry used to seal wax on official documents or letters, often bearing a distinctive family crest or personal symbol.',
  type: 'loot',
  rarity: 'common',
  value: 5,
  weight: 0,
  size: 'Medium',
});
