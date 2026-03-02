import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: 'f1e2d3c4b5a6',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully generated based on SRD Rogue class feature data.',
  },
  description:
    "When you reach 4th level, and again at 8th, 10th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  embedding: {},
  image: 'https://example.com/assets/rogue-asi.png',
  level: 4,
  lore: 'Constant practice and the trials of adventure have sharpened your natural talents to their peak.',
  tags: ['rogue', 'class-feature', 'ability-score-improvement'],
});
