import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "           CCCCCCCCCC           ",
  "         CCCCCCCCCCCCCC         ",
  "        CCCCCCCCCCCCCCCC        ",
  "       CCCCCCCCCCCCCCCCCC       ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCC...CCCCCCCC...CCC      ",
  "      CCC...CCCCCCCC...CCC      ",
  "      CCC...CCCCCCCC...CCC      ",
  "      CCC...CCCCCCCC...CCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCC..............CCC      ",
  "      CCC..............CCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "      CCCCCCCCCCCCCCCCCCCC      ",
  "       ******************       ",
  "        ****************        ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Helm',
  slug: 'helm',
  category: 'Item',
  grid,
  zones: ["core","details","trim"],
  mapping: {
    "C": "core",
    ".": "details",
    "*": "trim"
  },
  anchors: {
    "core": [16, 16],
    "details": [16, 16],
    "trim": [16, 28]
  }
});
