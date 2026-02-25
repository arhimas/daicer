import { defineDamageType } from '@/features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'piercing',
  name: 'Piercing',
  compilation_state: {
    status: 'Valid',
  },
  description: "Puncturing and impaling attacks, including spears and monsters' bites, deal piercing damage.",
  embedding: {},
  image: '',
});
