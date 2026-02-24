import { defineDamageType } from '../../../features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'thunder',
  name: 'Thunder',
  description: 'A concussive burst of sound, such as the effect of the thunderwave spell, deals thunder damage.',
  embedding: {},
  image: '/api/2014/damage-types/thunder.png',
});
