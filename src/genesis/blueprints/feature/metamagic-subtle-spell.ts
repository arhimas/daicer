import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'metamagic-subtle-spell',
  name: 'Metamagic: Subtle Spell',
  compilation_state: {
    status: 'Valid',
    hash: '98f2e1a3b4c5d6e7f8g9h0i1j2k3l4m5',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature successfully mapped from reference data.',
  },
  description:
    'When you cast a spell, you can spend 1 sorcery point to cast it without any somatic or verbal components.',
  embedding: {},
  image: '',
  level: 3,
  lore: "True mastery of magic comes not from the volume of one's voice or the breadth of one's gestures, but from the purity of the inner spark. Subtle Spell allows a sorcerer to manifest their will as silently and still as a shadow.",
  tags: ['sorcerer', 'metamagic'],
});
