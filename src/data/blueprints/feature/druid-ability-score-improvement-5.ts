import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: '7f4c8b9a1d2e3f4g5h6i7j8k9l0m1n2o',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully compiled from reference data.',
  },
  description:
    "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  level: 19,
  lore: 'As you grow in power and experience, your physical and mental capabilities reach new heights, reflecting your dedication to your path.',
  tags: ['druid', 'class-feature'],
});
