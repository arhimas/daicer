import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "     SSSSSSSSSSSSSSSSSSSS       ",
  "   SSSSSSSSSSSSSSSSSSSSSSSS     ",
  "  SSSSSSSSSSSSSSSSSSSSSSSSSS    ",
  " SSSSSSSSSSS...SSSSSSSSSSSSSS   ",
  " SSSSSSSSS.......SSSSSSSSSSSS   ",
  " SSSSSSS...........SSSSSSSSSS   ",
  " SSSSSS.............SSSSSSSSSS  ",
  " SSSSSS.....%%%.....SSSSSSSSSS  ",
  " SSSSS.......%.......SSSSSSSSS  ",
  " SSSSSS.............SSSSSSSSSS  ",
  " SSSSSSS...........SSSSSSSSSS   ",
  " SSSSSSSSS.......SSSSSSSSSSSS   ",
  " SSSSSSSSSSS...SSSSSSSSSSSSSS   ",
  "  SSSSSSSSSSSSSSSSSSSSSSSSSS    ",
  "   SSSSSSSSSSSSSSSSSSSSSSSS     ",
  "     SSSSSSSSSSSSSSSSSSSS       ",
  "   SSSSSSSSSSSSSSSSSSSSSSSS     ",
  "  SSSSSSSSSSSSSSSSSSSSSSSSSS    ",
  " SSSSSSSSSSS...SSSSSSSSSSSSSS   ",
  " SSSSSSSSS.......SSSSSSSSSSSS   ",
  " SSSSSSS...........SSSSSSSSSS   ",
  " SSSSSS.............SSSSSSSSSS  ",
  " SSSSSS.....%%%.....SSSSSSSSSS  ",
  " SSSSS.......%.......SSSSSSSSS  ",
  " SSSSSS.............SSSSSSSSSS  ",
  " SSSSSSS...........SSSSSSSSSS   ",
  " SSSSSSSSS.......SSSSSSSSSSSS   ",
  " SSSSSSSSSSS...SSSSSSSSSSSSSS   ",
  "  SSSSSSSSSSSSSSSSSSSSSSSSSS    ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Water',
  slug: 'water',
  category: 'Terrain',
  grid,
  zones: ["surface","details","decor"],
  mapping: {
    "S": "surface",
    ".": "details",
    "%": "decor"
  },
  anchors: {
    "surface": [16, 16],
    "details": [16, 20],
    "decor": [16, 24]
  }
});
