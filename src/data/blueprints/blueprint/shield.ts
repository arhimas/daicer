import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['*', '*', '*', '*', '*', '*', ' '],
  [' ', '*', 'M', 'M', 'M', 'M', '*', ' '],
  [' ', '*', 'M', '#', '#', 'M', '*', ' '],
  [' ', '*', 'M', 'M', 'M', 'M', '*', ' '],
  [' ', ' ', '*', 'M', 'M', '*', ' ', ' '],
  [' ', ' ', ' ', '*', '*']
];

for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    grid[13 + i][13 + j] = shape[i][j];
  }
}

export default defineBlueprint({
  name: 'Shield',
  slug: 'shield',
  category: 'Item',
  grid,
  zones: ['primary-material', 'trim', 'core'],
  mapping: {
    '*': 'trim',
    'M': 'primary-material',
    '#': 'core'
  },
  anchors: {
    'core': [16, 16]
  }
});
