import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'metamagic-careful-spell',
  name: 'Metamagic: Careful Spell',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell's full force. To do so, you spend 1 sorcery point and choose a number of those creatures up to your Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell.",
  level: 3,
  lore: "A sorcerer's innate connection to the weave allows them to sculpt the raw energy of their spells, sparing their allies from the unintended consequences of their power.",
  tags: ['sorcerer', 'metamagic'],
});
