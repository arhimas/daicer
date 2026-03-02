import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['X', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', '|', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', '|', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', '|', ' ', ' ', ' ', ' '],
  [' ', ' ', 'E', '|', 'E', ' ', ' ', ' '],
  [' ', 'E', ' ', 'E', ' ', 'E']
];

// Placed near the center (offset x: 13, y: 13)
for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    grid[13 + i][13 + j] = shape[i][j];
  }
}

export default defineBlueprint({
  name: 'Ammunition',
  slug: 'ammunition',
  category: 'Item',
  grid,
  zones: ['weapon-head', 'shaft', 'fletching', 'casing', 'projectile'],
  mapping: {
    'X': 'weapon-head',
    '|': 'shaft',
    'E': 'fletching'
  },
  anchors: {
    'weapon-head': [13, 13]
  }
});
