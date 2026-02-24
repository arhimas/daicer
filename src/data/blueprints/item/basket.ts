import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'basket',
  name: 'Basket',
  description: 'A standard basket used for carrying goods, typically woven from wicker or similar materials.',
  type: 'container',
  rarity: 'common',
  value: 4,
  weight: 2,
  size: 'Medium',
  equipment_data: {},
  tags: ['adventuring-gear', 'standard-gear'],
});
