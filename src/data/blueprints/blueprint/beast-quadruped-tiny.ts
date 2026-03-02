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
  "                                ",
  "                                ",
  "           H                    ",
  "          HH A                  ",
  "         HHCCC T                ",
  "          CCCCC T               ",
  "          L   L                 ",
  "          L   L                 ",
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
  name: 'Beast Quadruped (Tiny)',
  slug: 'beast-quadruped-tiny',
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
        10,
        13
    ],
    "core": [
        12,
        15
    ],
    "legs": [
        12,
        17
    ],
    "tail": [
        16,
        15
    ],
    "accessory": [
        13,
        13
    ]
}
});
