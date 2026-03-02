import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

// Inject Beast Shape Centered (10x12)
// Placed near the center (offset x: 10, y: 10)
const beastShape = [
  ['O', 'O', 'O', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', 'O', 'O', 'O', 'O', 'O', ' ', ' ', ' ', ' ', ' '],
  [' ', 'O', 'O', 'O', 'O', 'O', 'O', ' ', ' ', 'T', ' ', ' '],
  [' ', ' ', ' ', '#', '#', '#', '#', ' ', 'T', 'T', 'T', ' '],
  [' ', ' ', '#', '#', '#', '#', '#', '#', 'T', 'T', ' ', ' '],
  [' ', ' ', '#', '#', '#', '#', '#', '#', '#', '#', ' ', ' '],
  [' ', ' ', '#', '#', '#', '#', '#', '#', '#', '#', ' ', ' '],
  [' ', ' ', 'L', 'L', ' ', ' ', ' ', ' ', 'L', 'L', ' ', ' '],
  [' ', ' ', 'L', 'L', ' ', ' ', ' ', ' ', 'L', 'L', ' ', ' '],
  [' ', ' ', 'L', 'L', ' ', ' ', ' ', ' ', 'L', 'L']
];

for (let i = 0; i < beastShape.length; i++) {
  for (let j = 0; j < beastShape[i].length; j++) {
    grid[10 + i][10 + j] = beastShape[i][j];
  }
}

export default defineBlueprint({
  name: 'Beast',
  slug: 'beast',
  category: 'Creature',
  grid,
  zones: ['head', 'core', 'legs', 'tail', 'accessory'],
  mapping: {
    'O': 'head',
    '#': 'core',
    'L': 'legs',
    'T': 'tail',
    'A': 'accessory'
  },
  anchors: {
    // Math reference: Central point of head in the 32x32 grid (offset + relative pos)
    'head': [14, 11]
  }
});
