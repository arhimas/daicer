import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: '7f8e9a1b2c3d4e5f6g7h8i9j0k1l2m3n',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Standard Ranger class feature at level 16.',
  },
  description:
    "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  level: 16,
  lore: 'As you grow in power and experience, your physical and mental capabilities sharpen to their peak.',
  tags: ['ranger'],
});
