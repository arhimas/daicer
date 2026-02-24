import { defineItem } from '../../../features/genesis-core/blueprints';

export default defineItem({
  slug: 'dice-set',
  name: 'Dice Set',
  description:
    'This item encompasses a wide range of game pieces, including dice and decks of cards (for games such as Three-Dragon Ante). A few common examples appear on the Tools table, but other kinds of gaming sets exist. If you are proficient with a gaming set, you can add your proficiency bonus to ability checks you make to play a game with that set. Each type of gaming set requires a separate proficiency.',
  type: 'tool',
  rarity: 'common',
  value: 1,
  weight: 0,
  size: 'Medium',
});
