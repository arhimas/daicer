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
  "  WWWWWWWW CCCCCCCCC WWWWWWWW   ",
  "  WWWWWWWW CCCCCCCCC WWWWWWWW   ",
  "  WWWWWWWW CCCCCCCCC WWWWWWWW   ",
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
  name: 'Avian (Small)',
  slug: 'avian-small',
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
    "head": [16, 4],
    "core": [16, 12],
    "legs": [16, 16],
    "wings": [16, 12],
    "tail": [16, 22]
  }
});
