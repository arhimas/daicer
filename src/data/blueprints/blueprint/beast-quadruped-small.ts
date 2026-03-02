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
  "           HH                   ",
  "          HHHH                  ",
  "          HHHH   AA             ",
  "           CCCCCCCCC            ",
  "         CCCCCCCCCCCC T         ",
  "         CCCCCCCCCCCC TT        ",
  "         CCCCCCCCCCCC  T        ",
  "         L  L    L  L           ",
  "         L  L    L  L           ",
  "         L  L    L  L           ",
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
  name: 'Beast Quadruped (Small)',
  slug: 'beast-quadruped-small',
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
        12,
        12
    ],
    "core": [
        14,
        15
    ],
    "legs": [
        14,
        19
    ],
    "tail": [
        23,
        16
    ],
    "accessory": [
        18,
        13
    ]
}
});
