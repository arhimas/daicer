import { defineItem } from '@/features/genesis-core/blueprints';

export default defineItem({
  slug: 'horn',
  name: 'Horn',
  description:
    'Several of the most common types of musical instruments are shown on the table as examples. If you have proficiency with a given musical instrument, you can add your proficiency bonus to any ability checks you make to play music with the instrument. A bard can use a musical instrument as a spellcasting focus. Each type of musical instrument requires a separate proficiency.',
  type: 'tool',
  rarity: 'common',
  value: 3,
  weight: 2,
  size: 'Medium',
});
