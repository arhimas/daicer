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
  "                                ",
  "                                ",
  "               HH               ",
  "               HH               ",
  "              CCCC              ",
  "             lCCCCr             ",
  "             lCCCCr             ",
  "              LLLL              ",
  "              L  L              ",
  "              L  L              ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
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
  name: 'Humanoid (Tiny)',
  slug: 'humanoid-tiny',
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
        10
    ],
    "core": [
        15,
        13
    ],
    "hand-l": [
        13,
        13
    ],
    "hand-r": [
        18,
        13
    ],
    "legs": [
        15,
        16
    ]
}
});
