import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard Rogue class feature at 10th level.',
  },
  description:
    "When you reach 4th level, and again at 8th, 10th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  level: 10,
  lore: 'Intense training and field experience allow you to push your physical and mental limits further than ever before.',
  tags: ['rogue', 'utility'],
});
