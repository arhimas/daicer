import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "             ......             ",
  "          ............          ",
  "        ................        ",
  "       ..................       ",
  "      ....................      ",
  "     ......................     ",
  "    ........................    ",
  "    ........................    ",
  "   ..........................   ",
  "   ..........................   ",
  "   ..........................   ",
  "    ........................    ",
  "    ........................    ",
  "     ......................     ",
  "      ....................      ",
  "       ..................       ",
  "         ..............         ",
  "             QQQQQQ             ",
  "             QQQQQQ             ",
  "             QQQQQQ             ",
  "             QQQQQQ             ",
  "             QQQQQQ             ",
  "             QQQQQQ             ",
  "            RQQQQQQR            ",
  "           RRRQQQQRRR           ",
  "          RRRRRQRRRRRR          ",
  "         RRRRRR RRRRRRR         ",
  "        RRRRR     RRRRRR        ",
  "       RRR           RRRR       ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Tree',
  slug: 'tree',
  category: 'Terrain',
  grid,
  zones: ["structure","details","roots"],
  mapping: {
    "Q": "structure",
    ".": "details",
    "R": "roots"
  },
  anchors: {
    "structure": [16, 24],
    "details": [16, 8],
    "roots": [16, 28]
  }
});
