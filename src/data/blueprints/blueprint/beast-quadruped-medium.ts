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
  "              HHH               ",
  "             HHHHH              ",
  "            HHHHHHH             ",
  "            HHHHHHH             ",
  "             HHHHH   AAAA       ",
  "              CCC   AAAAAA      ",
  "            CCCCCCCCAAAAAA T    ",
  "           CCCCCCCCCCCCCCCC TT  ",
  "          CCCCCCCCCCCCCCCCCTTT  ",
  "          CCCCCCCCCCCCCCCCCTTT  ",
  "          CCCCCCCCCCCCCCCCCTT   ",
  "          LLL CCCCCCCCC LLL T   ",
  "          LLL  CCCCCCC  LLL     ",
  "          LLL           LLL     ",
  "          LLL           LLL     ",
  "         LLLL           LLLL    ",
  "         LLLL           LLLL    ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Beast Quadruped (Medium)',
  slug: 'beast-quadruped-medium',
  category: 'Creature',
  grid,
  zones: ["head","core","legs","tail","accessory"],
  mapping: {
    "H": "head",
    "C": "core",
    "L": "legs",
    "T": "tail",
    "A": "accessory"
},
  anchors: {
    "head": [
        14,
        10
    ],
    "core": [
        16,
        16
    ],
    "legs": [
        17,
        22
    ],
    "tail": [
        28,
        16
    ],
    "accessory": [
        23,
        13
    ]
}
});
