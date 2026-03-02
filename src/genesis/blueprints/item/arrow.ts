import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'arrow',
  name: 'Arrow',
  description:
    'Arrows are used with a weapon that has the ammunition property to make a ranged attack. Each time you attack with the weapon, you expend one piece of ammunition. Drawing the ammunition from a quiver, case, or other container is part of the attack. At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield.',
  type: 'loot',
  rarity: 'common',
  value: 1,
  weight: 1,
  size: 'Medium',
  equipment_data: {
    properties: ['ammunition'],
  },
});
