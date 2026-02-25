import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'spellcasting-ranger',
  name: 'Spellcasting: Ranger',
  compilation_state: {
    status: 'Valid',
    hash: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped Ranger Spellcasting feature.',
  },
  description:
    'By the time you reach 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does. See chapter 10 for the general rules of spellcasting and chapter 11 for the ranger spell list.',
  level: 2,
  lore: 'By the time you reach 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does.',
  tags: ['ranger', 'spellcasting', 'nature-magic'],
});
