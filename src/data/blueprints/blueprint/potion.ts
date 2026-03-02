import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['C', 'C', ' ', ' ', ' '],
  [' ', ' ', ' ', 'F', 'F', ' ', ' ', ' '],
  [' ', ' ', 'F', '~', '~', 'F', ' ', ' '],
  [' ', 'F', '~', '~', '~', '~', 'F', ' '],
  [' ', 'F', '-', '~', '~', '-', 'F', ' '],
  [' ', 'F', '~', '~', '~', '~', 'F', ' '],
  [' ', ' ', 'F', 'F', 'F', 'F']
];

for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    grid[12 + i][12 + j] = shape[i][j];
  }
}

export default defineBlueprint({
  name: 'Potion',
  slug: 'potion',
  category: 'Item',
  grid,
  zones: ['flask', 'liquid', 'cork', 'label'],
  mapping: {
    'C': 'cork',
    'F': 'flask',
    '~': 'liquid',
    '-': 'label'
  },
  anchors: {
    'flask': [14, 15]
  }
});
