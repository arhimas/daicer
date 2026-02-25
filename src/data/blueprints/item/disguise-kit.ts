import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'disguise-kit',
  name: 'Disguise Kit',
  description:
    'This pouch of cosmetics, hair dye, and small props lets you create disguises that change your physical appearance. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to create a visual disguise.',
  type: 'tool',
  rarity: 'common',
  value: 25,
  weight: 3,
  size: 'Medium',
});
