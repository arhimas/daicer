import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'clothes-common',
  name: 'Clothes, common',
  description:
    'This set of clothes consists of a cloth tunic, belt, breeches, and shoes. It is the standard attire for commoners and peasants.',
  type: 'loot',
  rarity: 'common',
  value: 5,
  weight: 3,
  size: 'Medium',
});
