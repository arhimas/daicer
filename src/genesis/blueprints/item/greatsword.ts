import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'greatsword',
  name: 'Greatsword',
  description:
    'A massive two-handed sword capable of delivering devastating strikes. Requires great strength and coordination to wield effectively.',
  type: 'weapon',
  rarity: 'common',
  value: 50,
  weight: 6,
  size: 'Medium',
  equipment_data: {
    damage_dice: '2d6',
    damage_type: 'slashing',
    range_normal: 5,
    properties: ['heavy', 'two-handed'],
  },
});
