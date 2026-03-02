import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "             HHHHHH             ",
  "            HHHHHHHH            ",
  "            HHHHHHHH            ",
  "            HHHHHHHH            ",
  "            HHHHHHHH            ",
  "             HHHHHH             ",
  "           CCCCCCCCCC           ",
  "           CCCCCCCCCC           ",
  "           CCCCCCCCCC           ",
  "           CCCCCCCCCC           ",
  "        <<<CCCCCCCCCC>>>        ",
  "       <<<<CCCCCCCCCC>>>>       ",
  "       <<<<CCCCCCCCCC>>>>       ",
  "        <<<CCCCCCCCCC>>>        ",
  "           CCCCCCCCCC           ",
  "           CCCCCCCCCC           ",
  "           LLLLLLLLLL           ",
  "           LLLLLLLLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "           LLLL  LLLL           ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Humanoid (Medium)',
  slug: 'humanoid-medium',
  category: 'Creature',
  grid,
  zones: ["head","core","legs","hand-l","hand-r"],
  mapping: {
    "H": "head",
    "C": "core",
    "L": "legs",
    "<": "hand-l",
    ">": "hand-r"
},
  anchors: {
    "head": [
        15,
        4
    ],
    "core": [
        15,
        12
    ],
    "legs": [
        15,
        24
    ],
    "hand-l": [
        8,
        13
    ],
    "hand-r": [
        23,
        13
    ]
}
});
