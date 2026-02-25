import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'reckless-attack',
  name: 'Reckless Attack',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.',
  level: 2,
  tags: ['barbarian'],
});
