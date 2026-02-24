import { defineDamageType } from '../../../features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'poison',
  name: 'Poison',
  description: "Venomous stings and the toxic gas of a green dragon's breath deal poison damage.",
  embedding: {},
  image: '/api/2014/damage-types/poison',
});
