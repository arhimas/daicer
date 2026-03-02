import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'arcane-recovery',
  name: 'Arcane Recovery',
  compilation_state: {
    status: 'Valid',
  },
  description:
    "You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher. For example, if you're a 4th-level wizard, you can recover up to two levels worth of spell slots. You can recover either a 2nd-level spell slot or two 1st-level spell slots.",
  level: 1,
  lore: 'Wizards spend years deciphering the flow of the Weave, learning how to pluck its strands even when their internal reserves are nearly spent.',
  tags: ['wizard'],
});
