import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'candle',
  name: 'Candle',
  description: 'For 1 hour, a candle sheds bright light in a 5-foot radius and dim light for an additional 5 feet.',
  type: 'loot',
  rarity: 'common',
  value: 1,
  weight: 0,
  size: 'Medium',
});
