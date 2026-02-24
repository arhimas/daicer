import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'spellcasting-bard',
  name: 'Spellcasting: Bard',
  compilation_state: {
    status: 'Valid',
    hash: '8f2e1a9c3b4d5e6f',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully mapped from SRD reference data.',
  },
  description:
    'You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. Your spells are part of your vast repertoire, magic that you can tune to different situations. At 1st level, you know two cantrips of your choice from the bard spell list. You know four 1st-level spells of your choice from the bard spell list. Charisma is your spellcasting ability for your bard spells since your magic draws on your heart and soul you pour into the performance of your music or oration. You can use a musical instrument as a spellcasting focus for your bard spells.',
  embedding: {},
  image: 'https://www.dndbeyond.com/attachments/2/707/bard.png',
  level: 1,
  lore: 'The music of the cosmos is a tapestry of sound and silence, and the bard is its most dedicated weaver.',
  tags: ['bard', 'spellcasting', 'class-feature'],
});
