import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['M', 'M', 'M', 'M', 'M', 'M', ' ', ' '],
  [' ', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', ' '],
  [' ', 'M', 'M', ' ', '*', '*', ' ', 'M', 'M', ' '],
  [' ', 'M', 'M', ' ', '*', '*', ' ', 'M', 'M', ' '],
  [' ', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', ' '],
  [' ', ' ', 'M', 'M', 'M', 'M', 'M', 'M', ' ', ' '],
  [' ', ' ', ' ', 'M', 'M', 'M', 'M', ' ', ' ', ' '],
  [' ', ' ', ' ', 'M', 'M', 'M', 'M']
];

for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    grid[12 + i][11 + j] = shape[i][j];
  }
}

export default defineBlueprint({
  name: 'Apparel',
  slug: 'apparel',
  category: 'Item',
  grid,
  zones: ['primary-material', 'trim', 'clasps', 'padding'],
  mapping: {
    'M': 'primary-material',
    '*': 'clasps'
  },
  anchors: {
    'primary-material': [16, 16]
  }
});
