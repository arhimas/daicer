import { defineDamageType } from '@/features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'cold',
  name: 'Cold',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "The infernal chill radiating from an ice devil's spear and the frigid blast of a white dragon's breath deal cold damage.",
  embedding: {},
});
