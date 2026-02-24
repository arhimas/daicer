import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'grappling-hook',
  name: 'Grappling hook',
  description:
    'A metal hook with multiple prongs used for climbing, typically attached to the end of a length of rope.',
  type: 'tool',
  rarity: 'common',
  value: 2,
  weight: 4,
  size: 'Medium',
});
