import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'flexible-casting-converting-spell-slot',
  name: 'Flexible Casting: Converting Spell Slot',
  compilation_state: {
    status: 'Valid',
    hash: '7c89f2a3',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from SRD data.',
  },
  description:
    "As a bonus action on your turn, you can expend one spell slot and gain a number of sorcery points equal to the slot's level.",
  embedding: {},
  image: '',
  level: 2,
  lore: 'The innate magic within a sorcerer is a fluid resource, capable of being broken down from its structured forms back into raw potential.',
  tags: ['sorcerer', 'class-feature'],
});
