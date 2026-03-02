import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                          AAAAAAAAAAAA                          ",
  "                          AAAAAAAAAAAA                          ",
  "                      AAAAAAAAAAAAAAAAAAAA                      ",
  "                      AAAAAAAAAAAAAAAAAAAA                      ",
  "                    AAAAAAAAAAAAAAAAAAAAAAAA                    ",
  "                    AAAAAAAAAAAAAAAAAAAAAAAA                    ",
  "      HHHHHHHHHH  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "      HHHHHHHHHH  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "    HHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC                ",
  "    HHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC                ",
  "    HHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC                ",
  "    HHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC                ",
  "    HHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC      TT        ",
  "    HHHHHHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC      TT        ",
  "      HHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTT      ",
  "      HHHHHHHHCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTT      ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTT    ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTT    ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTTTT  ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTTTT  ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTTTT  ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTTTT  ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTT    ",
  "              CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC  TTTTTTTT    ",
  "              LLLLLLLL                    LLLLLLLL    TTTT      ",
  "              LLLLLLLL                    LLLLLLLL    TTTT      ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "              LLLLLLLL                    LLLLLLLL              ",
  "                LLLL                        LLLL                ",
  "                LLLL                        LLLL                ",
  "                LLLL                        LLLL                ",
  "                LLLL                        LLLL                ",
  "                LLLL                        LLLL                ",
  "                LLLL                        LLLL                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Beast Quadruped (Large)',
  slug: 'beast-quadruped-large',
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
        22
    ],
    "core": [
        32,
        26
    ],
    "legs": [
        32,
        44
    ],
    "tail": [
        54,
        30
    ],
    "accessory": [
        32,
        14
    ]
}
});
