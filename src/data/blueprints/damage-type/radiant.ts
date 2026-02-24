import { defineDamageType } from '../../../features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'radiant',
  name: 'Radiant',
  compilation_state: {
    status: 'Valid',
    hash: '8f3e2a1b5c4d6e7f8g9h0i1j2k3l4m5n',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully imported from reference material.',
  },
  description:
    "Radiant damage, dealt by a cleric's flame strike spell or an angel's smiting weapon, sears the flesh like fire and overloads the spirit with power.",
  embedding: {},
  image: '/api/2014/damage-types/radiant',
});
