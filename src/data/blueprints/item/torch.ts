import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'torch',
  name: 'Torch',
  description:
    'A torch burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet. If you make a melee attack with a burning torch and hit, it deals 1 fire damage.',
  type: 'loot',
  rarity: 'common',
  value: 1,
  weight: 1,
  size: 'Medium',
  equipment_data: {
    damage_dice: '1',
    damage_type: 'fire',
  },
});
