import { defineDamageType } from '@/features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'necrotic',
  name: 'Necrotic',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Necrotic damage, dealt by certain undead and a spell such as chill touch, withers matter and even the soul.',
  embedding: {},
});
