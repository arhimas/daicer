import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "               CC               ",
  "              CCCC              ",
  "             CCCCCC             ",
  "             CCCCCC             ",
  "              CCCC              ",
  "               CC               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "               ||               ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Wand',
  slug: 'wand',
  category: 'Item',
  grid,
  zones: ["shaft","core"],
  mapping: {
    "|": "shaft",
    "C": "core"
  },
  anchors: {
    "shaft": [16, 16],
    "core": [16, 4]
  }
});
