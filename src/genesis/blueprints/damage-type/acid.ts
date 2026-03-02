import { defineDamageType } from '@/features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'acid',
  name: 'Acid',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "The corrosive spray of a black dragon's breath and the dissolving enzymes secreted by a black pudding deal acid damage.",
  embedding: {},
});
