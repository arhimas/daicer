import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'signature-spell',
  name: 'Signature Spell',
  compilation_state: {
    status: 'Valid',
    hash: '7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Compiled from wizard class feature data.',
  },
  description:
    "When you reach 20th level, you gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared, they don't count against the number of spells you have prepared, and you can cast each of them once at 3rd level without expending a spell slot. When you do so, you can't do so again until you finish a short or long rest. If you want to cast either spell at a higher level, you must expend a spell slot as normal.",
  embedding: {},
  image: '',
  level: 20,
  lore: "The culmination of a wizard's lifelong study, allowing them to weave complex magic as easily as a commoner draws breath.",
  tags: ['wizard', 'class-feature', 'high-level'],
});
