import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['O', 'O', 'O', 'O', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', 'O', 'O', 'O', 'O', 'O', 'O', ' ', ' ', ' '],
  [' ', ' ', ' ', 'O', 'O', 'O', 'O', 'O', 'O', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', 'O', 'O', 'O', 'O', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', '#', '#', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', '#', '#', '#', '#', ' ', ' ', ' ', ' '],
  [' ', 'A', 'A', 'A', '#', '#', '#', '#', 'A', 'A', 'A', ' '],
  [' ', 'A', ' ', ' ', '#', '#', '#', '#', ' ', ' ', 'A', ' '],
  [' ', ' ', ' ', ' ', 'L', 'L', 'L', 'L', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', 'L', 'L', ' ', ' ', 'L', 'L', ' ', ' ', ' '],
  [' ', ' ', ' ', 'L', 'L', ' ', ' ', 'L', 'L', ' ', ' ', ' '],
  [' ', ' ', ' ', 'L', 'L', ' ', ' ', 'L', 'L']
];

for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    grid[10 + i][10 + j] = shape[i][j];
  }
}

export default defineBlueprint({
  name: 'Humanoid',
  slug: 'humanoid',
  category: 'Creature',
  grid,
  zones: ['head', 'core', 'arms', 'legs', 'accessory'],
  mapping: {
    'O': 'head',
    '#': 'core',
    'A': 'arms',
    'L': 'legs'
  },
  anchors: {
    'head': [16, 11]
  }
});
