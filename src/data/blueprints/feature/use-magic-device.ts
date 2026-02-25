import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'use-magic-device',
  name: 'Use Magic Device',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature successfully compiled from reference data.',
  },
  description:
    'By 13th level, you have learned enough about the workings of magic that you can improvise the use of items even when they are not intended for you. You ignore all class, race, and level requirements on the use of magic items.',
  level: 13,
  lore: 'A master thief knows that a lock is just a puzzle, and a magic item is just a lock with more complex tumblers.',
  tags: ['rogue', 'thief'],
});
