import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'greataxe',
  name: 'Greataxe',
  description: 'A heavy martial melee weapon with a large blade, capable of delivering devastating slashing blows.',
  type: 'weapon',
  rarity: 'common',
  value: 30,
  weight: 7,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1d12',
    damage_type: 'slashing',
    range_normal: 5,
    properties: ['heavy', 'two-handed'],
  },
});
