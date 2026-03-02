import { defineBlueprint } from '@/features/genesis-core/blueprints';

const generateEmptyGrid = (width: number, height: number): string[][] => {
  return Array.from({ length: height }, () => Array(width).fill(' '));
};

const grid = generateEmptyGrid(32, 32);

const shape = [
  ['Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q'],
  ['Q', '%', '%', 'Q', 'Q', '%', '%', 'Q'],
  ['Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q'],
  ['Q', '%', '%', 'Q', 'Q', '%', '%', 'Q'],
  ['Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q'],
  ['=', '=', '=', '=', '=', '=', '=', '='],
  ['=', '=', '=', '=', '=', '=', '=', '=']
];

for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
    grid[12 + i][12 + j] = shape[i][j];
  }
}

export default defineBlueprint({
  name: 'Wall',
  slug: 'wall',
  category: 'Terrain',
  grid,
  zones: ['structure', 'trim', 'decor'],
  mapping: {
    'Q': 'structure',
    '%': 'decor',
    '=': 'trim'
  },
  anchors: {
    'structure': [16, 16]
  }
});
