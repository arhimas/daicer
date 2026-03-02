import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "            ........            ",
  "          ............          ",
  "         ..............         ",
  "        .......GG.......        ",
  "        ......GGGG......        ",
  "       ........GG........       ",
  "       ..................       ",
  "       ...CCCCCCCCCCCC...       ",
  "       ..CCCCCCCCCCCCCC..       ",
  "       .CCCCCCCCCCCCCCCC.       ",
  "      ..CCCCCCCCCCCCCCCC..      ",
  "      ..CCCCCCCCCCCCCCCC..      ",
  "      .CCCCCCCCCCCCCCCCCC.      ",
  "      .CCCCCCCCCCCCCCCCCC.      ",
  "      ..CCCCCCCCCCCCCCCC..      ",
  "       ...CCCCCCCCCCCC...       ",
  "        ................        ",
  "         ..............         ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Amorphous (Tiny)',
  slug: 'ooze-tiny',
  category: 'Creature',
  grid,
  zones: ["core","details","gem"],
  mapping: {
    "C": "core",
    ".": "details",
    "G": "gem"
  },
  anchors: {
    "core": [16, 16],
    "details": [16, 20],
    "gem": [16, 12]
  }
});
