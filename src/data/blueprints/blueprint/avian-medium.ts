import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "             HHHHHH             ",
  "            HHHHHHHH            ",
  "            HH    HH            ",
  "              CCCC              ",
  "    WWWW     CCCCCC     WWWW    ",
  "   WWWWWW   CCCCCCCC   WWWWWW   ",
  "  WWWWWWWW CCCCCCCCCC WWWWWWWW  ",
  "  WWWWWWWW CCCCCCCCCC WWWWWWWW  ",
  "  WWWWWWWW CCCCCCCCCC WWWWWWWW  ",
  " WWWWWWWWW CCCCCCCCCC WWWWWWWWW ",
  " WWWWWWWWW  CCCCCCCC  WWWWWWWWW ",
  " WWWWWWWWW  CCCCCCCC  WWWWWWWWW ",
  "  WWWWWWWW   CCCCCC   WWWWWWWW  ",
  "  WWWWWWWW    CCCC    WWWWWWWW  ",
  "   WWWWWW      CC      WWWWWW   ",
  "    WWWW       CC       WWWW    ",
  "              TTTT              ",
  "             TTTTTT             ",
  "             TTTTTT             ",
  "            TTTTTTTT            ",
  "            TTT  TTT            ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Avian (Medium)',
  slug: 'avian-medium',
  category: 'Creature',
  grid,
  zones: ["head","core","legs","wings","tail"],
  mapping: {
    "H": "head",
    "C": "core",
    "L": "legs",
    "W": "wings",
    "T": "tail"
  },
  anchors: {
    "head": [16, 5],
    "core": [16, 11],
    "legs": [16, 14],
    "wings": [16, 12],
    "tail": [16, 22]
  }
});
