import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'spellbook',
  name: 'Spellbook',
  description:
    'Essential for wizards, a spellbook is a leather-bound tome with 100 blank vellum pages suitable for recording spells.',
  type: 'tool',
  rarity: 'common',
  value: 50,
  weight: 3,
  size: 'Medium',
});
