import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'block-and-tackle',
  name: 'Block and tackle',
  description:
    'A set of pulleys with a cable threaded through them and a hook to attach to objects, a block and tackle allows you to hoist up to four times the weight you can normally lift.',
  type: 'tool',
  rarity: 'common',
  value: 1,
  weight: 5,
  size: 'Medium',
});
