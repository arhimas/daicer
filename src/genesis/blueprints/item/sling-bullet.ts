import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'sling-bullet',
  name: 'Sling bullet',
  description:
    'A collection of small, rounded stones or lead pellets used as ammunition for slings. This entry represents a pouch of 20 bullets.',
  type: 'loot',
  rarity: 'common',
  value: 4,
  weight: 1.5,
  size: 'Medium',
  tags: ['ammunition', 'adventuring-gear'],
});
