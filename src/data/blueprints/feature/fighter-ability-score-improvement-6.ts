import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: 'f626618e',
    last_run: '2024-05-22T12:00:00Z',
    summary: 'Standard 5e fighter ability score improvement compiled from reference data.',
  },
  description:
    "When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  embedding: {},
  image: '',
  level: 16,
  lore: "A fighter's dedication to their craft is reflected in their physical and mental growth over time as they reach the peak of their conditioning.",
  tags: ['fighter'],
});
