import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'ability-score-improvement',
  name: 'Ability Score Improvement',
  compilation_state: {
    status: 'Valid',
    hash: '7d4e5f6a8b9c0d1e2f3a4b5c6d7e8f9a',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Compiled successfully from reference data.',
  },
  description:
    "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.",
  embedding: {},
  image: 'https://www.dndbeyond.com/content/12.2.0/compendium/images/druid.png',
  level: 16,
  lore: "A druid's connection to the natural world grants them wisdom beyond mortal years, and their physical form adapts to the harsh environments they protect.",
  tags: ['druid', 'ability-score-improvement'],
});
