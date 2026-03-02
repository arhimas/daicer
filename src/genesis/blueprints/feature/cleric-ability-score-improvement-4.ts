import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: 'a2b4c6d8',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully compiled level 16 cleric feature.',
  },
  description:
    "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  level: 16,
  lore: 'As your connection to your deity deepens, your physical and mental capacities are refined through divine grace and worldly experience.',
  tags: ['cleric', 'class-feature'],
});
