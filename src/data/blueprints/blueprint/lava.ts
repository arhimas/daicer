import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "        DDDDDDDDDDDDDD          ",
  "      DDDDDDDDDDDDDDDDDD        ",
  "     DDDDDDDDDDDDDDDDDDDD       ",
  "    SSSSSSSSSSSSSSSSSSSSSS      ",
  "   SSSSSSSSSSSSSSSSSSSSSSSS     ",
  "  SSSSSSSS......SSSSSSSSSSSS    ",
  " SSSSSSSS........SSSSSSSSSSSS   ",
  " SSSSSSS..........SSSSSSSSSSS   ",
  " SSSSSSS..........SSSSSSSSSSS   ",
  " SSSSSSSS........SSSSSSSSSSSS   ",
  " SSSSSSS..........SSSSSSSSSSS   ",
  " SSSSSSS..........SSSSSSSSSSS   ",
  " SSSSSSSS........SSSSSSSSSSSS   ",
  "  SSSSSSSS......SSSSSSSSSSSS    ",
  "   SSSSSSSSSSSSSSSSSSSSSSSS     ",
  "    SSSSSSSSSSSSSSSSSSSSSS      ",
  "     DDDDDDDDDDDDDDDDDDDD       ",
  "      DDDDDDDDDDDDDDDDDD        ",
  "       DDDDDDDDDDDDDDDD         ",
  "        DDDDDDDDDDDDDD          ",
  "         DDDDDDDDDDDD           ",
  "          DDDDDDDDDD            ",
  "           DDDDDDDD             ",
  "           DDDDDDDD             ",
  "            DDDDDD              ",
  "            DDDDDD              ",
  "             DDDD               ",
  "             DDDD               ",
  "              DD                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Lava',
  slug: 'lava',
  category: 'Terrain',
  grid,
  zones: ["surface","details","foundation"],
  mapping: {
    "S": "surface",
    ".": "details",
    "D": "foundation"
  },
  anchors: {
    "surface": [16, 16],
    "details": [16, 20],
    "foundation": [16, 28]
  }
});
