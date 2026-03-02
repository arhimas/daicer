import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "               XX               ",
  "              XXXX              ",
  "             XXXXXX             ",
  "            XX XX XX            ",
  "            XX XX XX            ",
  "           XXX XX XXX           ",
  "           X   XX   X           ",
  "               XX               ",
  "             XXXXXX             ",
  "             XXXXXX             ",
  "               XX               ",
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
  "              %%%%              ",
  "              %%%%              ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Weapon (Polearm)',
  slug: 'weapon-polearm',
  category: 'Item',
  grid,
  zones: ["shaft","weapon-head","decor"],
  mapping: {
    "|": "shaft",
    "X": "weapon-head",
    "%": "decor"
  },
  anchors: {
    "shaft": [16, 16],
    "weapon-head": [16, 4],
    "decor": [16, 24]
  }
});
