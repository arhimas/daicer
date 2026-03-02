import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'ram-portable',
  name: 'Ram, portable',
  description:
    'You can use a portable ram to break down doors. When doing so, you gain a +4 bonus on the Strength check. One other character can help you use the ram, giving you advantage on this check.',
  type: 'tool',
  rarity: 'common',
  value: 4,
  weight: 35,
  size: 'Medium',
});
