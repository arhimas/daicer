import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'orb',
  name: 'Orb',
  description:
    'An arcane focus is a special item--an orb, a crystal, a rod, a specially constructed staff, a wand-like length of wood, or some similar item--designed to channel the power of arcane spells. A sorcerer, warlock, or wizard can use such an item as a spellcasting focus.',
  type: 'tool',
  rarity: 'common',
  value: 20,
  weight: 3,
  size: 'Medium',
  tags: ['arcane-foci', 'adventuring-gear'],
  compilation_state: {
    status: 'Valid',
  },
});
