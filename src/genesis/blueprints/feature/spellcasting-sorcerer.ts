import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'spellcasting-sorcerer',
  name: 'Spellcasting: Sorcerer',
  compilation_state: {
    status: 'Valid',
    hash: '8f2a3b1c',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Standard Sorcerer spellcasting feature mapped from reference.',
  },
  description:
    "An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. This font of magic, whatever its origin, fuels your spells. You know a number of cantrips of your choice from the sorcerer spell list. You learn additional sorcerer cantrips of your choice at higher levels. The Sorcerer table shows how many spell slots you have to cast your sorcerer spells of 1st level and higher. To cast one of these sorcerer spells, you must expend a slot of the spell's level or higher. You regain all expended spell slots when you finish a long rest. Charisma is your spellcasting ability for your sorcerer spells, since the power of your magic relies on your ability to project your will into the world.",
  embedding: {},
  image: 'https://example.com/images/sorcerer-magic.png',
  level: 1,
  lore: 'The magic within you is a gift, a curse, or a birthright, flowing through your veins like blood.',
  tags: ['sorcerer', 'spellcasting', 'class-feature'],
});
