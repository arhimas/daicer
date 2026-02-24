import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'shovel',
  name: 'Shovel',
  description:
    'A standard tool used for digging through dirt, sand, or gravel. It consists of a broad metal blade attached to a wooden handle.',
  type: 'tool',
  rarity: 'common',
  value: 2,
  weight: 5,
  size: 'Medium',
  compilation_state: {
    status: 'Valid',
  },
  width: 1000,
});
