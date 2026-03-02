import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "               GG               ",
  "              GGGG              ",
  "             GGGGGG             ",
  "             GGGGGG             ",
  "            CCCGGCCC            ",
  "          CCCC    CCCC          ",
  "         CCCC      CCCC         ",
  "        CCCC        CCCC        ",
  "       CCCC          CCCC       ",
  "       CCC            CCC       ",
  "       CCC            CCC       ",
  "       CCC            CCC       ",
  "       CCCC          CCCC       ",
  "        CCCC        CCCC        ",
  "         CCCC      CCCC         ",
  "          CCCC    CCCC          ",
  "            CCCCCCCC            ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Ring',
  slug: 'ring',
  category: 'Item',
  grid,
  zones: ["core","gem"],
  mapping: {
    "C": "core",
    "G": "gem"
  },
  anchors: {
    "core": [16, 16],
    "gem": [16, 12]
  }
});
