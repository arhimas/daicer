import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'brutal-critical-3-dice',
  name: 'Brutal Critical (3 dice)',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack. This increases to two additional dice at 13th level and three additional dice at 17th level.',
  level: 17,
  lore: "The barbarian's fury lends a devastating weight to their strikes, turning a precise hit into a lethal execution.",
  tags: ['barbarian'],
});
