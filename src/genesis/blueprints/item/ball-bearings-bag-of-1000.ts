import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'ball-bearings-bag-of-1000',
  name: 'Ball bearings (bag of 1,000)',
  description:
    "As an action, you can spill these tiny metal balls from their pouch to cover a level, square area that is 10 feet on a side. A creature moving across the covered area must succeed on a DC 10 Dexterity saving throw or fall prone. A creature moving through the area at half speed doesn't need to make the save.",
  type: 'loot',
  rarity: 'common',
  value: 0,
  weight: 2,
  size: 'Medium',
  width: 10,
});
