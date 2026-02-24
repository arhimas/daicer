import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: '7d8e9f2a',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Compiled from standard 5e wizard feature data.',
  },
  description:
    "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  embedding: {},
  image: '',
  level: 19,
  lore: 'As a wizard grows in power, their constant mental exercises and experiences in the field sharpen their natural capabilities or bolster their physical hardiness.',
  tags: ['wizard'],
});
