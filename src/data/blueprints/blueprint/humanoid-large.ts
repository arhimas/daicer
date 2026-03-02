import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                          HHHHHHHHHHHH                          ",
  "                          HHHHHHHHHHHH                          ",
  "                        HHHHHHHHHHHHHHHH                        ",
  "                        HHHHHHHHHHHHHHHH                        ",
  "                        HHHHHHHHHHHHHHHH                        ",
  "                        HHHHHHHHHHHHHHHH                        ",
  "                        HHHHHHHHHHHHHHHH                        ",
  "                        HHHHHHHHHHHHHHHH                        ",
  "                          HHHHHHHHHHHH                          ",
  "                          HHHHHHHHHHHH                          ",
  "                      CCCCCCCCCCCCCCCCCCCC                      ",
  "                      CCCCCCCCCCCCCCCCCCCC                      ",
  "                    CCCCCCCCCCCCCCCCCCCCCCCC                    ",
  "                    CCCCCCCCCCCCCCCCCCCCCCCC                    ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "              LLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRR              ",
  "              LLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRR              ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "            LLLLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRRRR            ",
  "              LLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRR              ",
  "              LLLLCCCCCCCCCCCCCCCCCCCCCCCCCCCCRRRR              ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "                  CCCCCCCCCCCCCCCCCCCCCCCCCCCC                  ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                    GGGGGGGGGG    GGGGGGGGGG                    ",
  "                  GGGGGGGGGGGG    GGGGGGGGGGGG                  ",
  "                  GGGGGGGGGGGG    GGGGGGGGGGGG                  ",
  "                  GGGGGGGGGGGG    GGGGGGGGGGGG                  ",
  "                  GGGGGGGGGGGG    GGGGGGGGGGGG                  ",
  "                                                                ",
  "                                                                ",
  "                                                                ",
  "                                                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Humanoid (Large)',
  slug: 'humanoid-large',
  category: 'Creature',
  grid,
  zones: ["head","core","legs","hand-l","hand-r"],
  mapping: {
    "H": "head",
    "C": "core",
    "G": "legs",
    "L": "hand-l",
    "R": "hand-r"
},
  anchors: {
    "head": [
        32,
        10
    ],
    "core": [
        32,
        28
    ],
    "legs": [
        32,
        50
    ],
    "hand-l": [
        14,
        30
    ],
    "hand-r": [
        48,
        30
    ]
}
});
