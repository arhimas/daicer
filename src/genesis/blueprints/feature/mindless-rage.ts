import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'mindless-rage',
  name: 'Mindless Rage',
  compilation_state: {
    status: 'Valid',
    summary: 'Barbarian Path of the Berserker feature.',
  },
  description:
    "Beginning at 6th level, you can't be charmed or frightened while raging. If you are charmed or frightened when you enter your rage, the effect is suspended for the duration of the rage.",
  level: 6,
  lore: 'The primal fury of a berserker is so overwhelming that it leaves no room for doubt, fear, or magical manipulation.',
  tags: ['barbarian', 'berserker'],
});
