import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['B'],
  [' ', ' ', ' ', ' ', ' ', ' ', 'B', 'B'],
  [' ', ' ', ' ', ' ', ' ', 'B', 'B', ' '],
  [' ', ' ', ' ', ' ', 'B', 'B', ' ', ' '],
  [' ', ' ', ' ', 'B', 'B', ' ', ' ', ' '],
  [' ', ' ', 'B', 'B', ' ', ' ', ' ', ' '],
  [' ', 'H', 'H', ' ', ' ', ' ', ' ', ' '],
  [' ', 'P']
];

for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    if (shape[i][j]) {
      grid[10 + i][12 + j] = shape[i][j];
    }
  }
}

export default defineBlueprint({
  name: 'Weapon',
  slug: 'weapon',
  category: 'Item',
  grid,
  zones: ['blade', 'hilt', 'pommel', 'shaft', 'weapon-head'],
  mapping: {
    'B': 'blade',
    'H': 'hilt',
    'P': 'pommel'
  },
  anchors: {
    'hilt': [13, 16]
  }
});
