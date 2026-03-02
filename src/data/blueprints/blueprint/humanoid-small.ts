import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "             HHHHHH             ",
  "             HHHHHH             ",
  "             HHHHHH             ",
  "             HHHHHH             ",
  "             HHHHHH             ",
  "            CCCCCCCC            ",
  "            CCCCCCCC            ",
  "        lll CCCCCCCC rrr        ",
  "        lll CCCCCCCC rrr        ",
  "        lll CCCCCCCC rrr        ",
  "        lll CCCCCCCC rrr        ",
  "            CCCCCCCC            ",
  "            CCCCCCCC            ",
  "            LLLLLLLL            ",
  "            LLLLLLLL            ",
  "            LLLLLLLL            ",
  "            LLLLLLLL            ",
  "            LLLLLLLL            ",
  "            LLLLLLLL            ",
  "            LLLLLLLL            ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Humanoid (Small)',
  slug: 'humanoid-small',
  category: 'Creature',
  grid,
  zones: ["head","core","legs","hand-l","hand-r"],
  mapping: {
    "H": "head",
    "C": "core",
    "L": "legs",
    "l": "hand-l",
    "r": "hand-r"
},
  anchors: {
    "head": [
        15,
        8
    ],
    "core": [
        15,
        14
    ],
    "legs": [
        15,
        22
    ],
    "hand-l": [
        9,
        14
    ],
    "hand-r": [
        22,
        14
    ]
}
});
