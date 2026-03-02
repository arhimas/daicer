import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ['S', '.', '.', '.', '.', '.', '.', 'S'],
  ['S', '.', 'S', 'S', 'S', 'S', '.', 'S'],
  ['S', '.', 'S', 'S', 'S', 'S', '.', 'S'],
  ['S', '.', 'S', 'S', 'S', 'S', '.', 'S'],
  ['S', '.', '.', '.', '.', '.', '.', 'S'],
  ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D']
];

for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    grid[12 + i][12 + j] = shape[i][j];
  }
}

export default defineBlueprint({
  name: 'Floor',
  slug: 'floor',
  category: 'Terrain',
  grid,
  zones: ['surface', 'foundation', 'details'],
  mapping: {
    'S': 'surface',
    '.': 'details',
    'D': 'foundation'
  },
  anchors: {
    'surface': [16, 16]
  }
});
