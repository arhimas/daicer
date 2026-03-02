import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'hammer',
  name: 'Hammer',
  description:
    'A standard hammer, typically used for driving pitons or other general utility tasks. It is considered part of standard adventuring gear.',
  type: 'tool',
  rarity: 'common',
  value: 1,
  weight: 3,
  size: 'Medium',
  width: 1e100,
});
