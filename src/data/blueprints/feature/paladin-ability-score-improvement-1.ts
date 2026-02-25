import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: '8f2b3c4d5e6f7g8h',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully parsed from reference data.',
  },
  description:
    "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  embedding: {},
  image: '',
  level: 4,
  lore: 'The path of the paladin requires constant refinement of mind, body, and spirit.',
  tags: ['paladin'],
});
