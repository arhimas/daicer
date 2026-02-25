import { defineDamageType } from '@/features/genesis-core/blueprints';

export default defineDamageType({
  slug: 'slashing',
  name: 'Slashing',
  description: "Swords, axes, and monsters' claws deal slashing damage.",
  image: '/api/2014/damage-types/slashing',
});
