import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "                                ",
  "              HHH               ",
  "             HHHHH              ",
  "             H H H              ",
  "               C                ",
  "              CCC               ",
  "     WWW     CCCCC     WWW      ",
  "    WWWWW   CCCCCCC   WWWWW     ",
  "    WWWWWW CCCCCCCCC WWWWWW     ",
  "   WWWWWWW CCCCCCCCC WWWWWWW    ",
  "   WWWWWWW CCCCCCCCC WWWWWWW    ",
  "   WWWWWWW CCCCCCCCC WWWWWWW    ",
  "   WWWWWWW CCCCCCCCC WWWWWWW    ",
  "   WWWWWWW CCCCCCCCC WWWWWWW    ",
  "   WWWWWWW  CCCCCCC  WWWWWWW    ",
  "   WWWWWW    CCCCC    WWWWWW    ",
  "    WWWW      CCC      WWWW     ",
  "               C                ",
  "              TTT               ",
  "             TTTTT              ",
  "             TTTTT              ",
  "            TTTTTTT             ",
  "            TT   TT             ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Avian (Tiny)',
  slug: 'avian-tiny',
  category: 'Creature',
  grid,
  zones: ["head","core","legs","wings","tail"],
  mapping: {
    "H": "head",
    "C": "core",
    "L": "legs", // Implicit inside core area if need be, but no L on this flat map
    "W": "wings",
    "T": "tail"
  },
  anchors: {
    "head": [16, 4],
    "core": [16, 12],
    "legs": [16, 16],
    "wings": [16, 12],
    "tail": [16, 22]
  }
});
