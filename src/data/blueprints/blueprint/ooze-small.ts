import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "          ............          ",
  "         ..............         ",
  "        ................        ",
  "       ..................       ",
  "      ....................      ",
  "      .......GGGG.........      ",
  "     .......GGGGGG.........     ",
  "     ........GGGG..........     ",
  "    ........................    ",
  "    ........................    ",
  "    ...CCCCCCCCCCCCCCCCCC...    ",
  "   ...CCCCCCCCCCCCCCCCCCCC...   ",
  "   ..CCCCCCCCCCCCCCCCCCCCCC..   ",
  "   ..CCCCCCCCCCCCCCCCCCCCCC..   ",
  "   .CCCCCCCCCCCCCCCCCCCCCCCC.   ",
  "   .CCCCCCCCCCCCCCCCCCCCCCCC.   ",
  "   .CCCCCCCCCCCCCCCCCCCCCCCC.   ",
  "   ..CCCCCCCCCCCCCCCCCCCCCC..   ",
  "   ..CCCCCCCCCCCCCCCCCCCCCC..   ",
  "    ...CCCCCCCCCCCCCCCCCC...    ",
  "    ........................    ",
  "     ......................     ",
  "       ..................       ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Amorphous (Small)',
  slug: 'ooze-small',
  category: 'Creature',
  grid,
  zones: ["core","details","gem"],
  mapping: {
    "C": "core",
    ".": "details",
    "G": "gem"
  },
  anchors: {
    "core": [16, 20],
    "details": [16, 24],
    "gem": [16, 16]
  }
});
