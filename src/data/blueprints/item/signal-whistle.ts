import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'signal-whistle',
  name: 'Signal whistle',
  description:
    'A small whistle used for signaling over distances. It produces a high-pitched sound that can be heard much farther than a human shout.',
  type: 'tool',
  rarity: 'common',
  value: 5,
  weight: 0,
  size: 'Medium',
});
