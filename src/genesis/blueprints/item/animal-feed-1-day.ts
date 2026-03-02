import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'animal-feed-1-day',
  name: 'Animal Feed (1 day)',
  description: "A day's worth of feed for a mount or other animal, typically consisting of grain or hay.",
  type: 'loot',
  rarity: 'common',
  value: 5,
  weight: 10,
  size: 'Medium',
});
