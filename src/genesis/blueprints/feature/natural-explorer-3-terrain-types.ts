import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'natural-explorer-3-terrain-types',
  name: 'Natural Explorer (3 terrain types)',
  compilation_state: {
    status: 'Valid',
    hash: '8f2e1a3b4c5d6e7f8g9h0i1j2k3l4m5n',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully compiled Ranger level 10 feature.',
  },
  description:
    "You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, or swamp. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you're proficient in. While traveling for an hour or more in your favored terrain, you gain the following benefits: Difficult terrain doesn't slow your group's travel. Your group can't become lost except by magical means. Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger. If you are traveling alone, you can move stealthily at a normal pace. When you forage, you find twice as much food as you normally would. While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area. You choose additional favored terrain types at 6th and 10th level.",
  embedding: {},
  image: 'https://www.dndbeyond.com/content/skills/ranger-feature.png',
  level: 10,
  lore: 'A master of the wild, the ranger moves through the most treacherous landscapes as if they were paved roads, reading the secrets of the earth and the movements of those who traverse it.',
  tags: ['ranger', 'exploration', 'utility'],
});
