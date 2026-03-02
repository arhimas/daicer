import { defineBlueprint } from '@/features/genesis-core/blueprints';

const grid = [
  "                                ",
  "                                ",
  "             CCC                ",
  "          CC...C                ",
  "         C...  C                ",
  "        C..    C                ",
  "       C..     C                ",
  "      C..      C                ",
  "      C.       C                ",
  "     C.        C                ",
  "     C.        C                ",
  "    C.         C                ",
  "    C.         C                ",
  "    C.         C                ",
  "   HC.         C                ",
  "   HH.         C                ",
  "   HH.         C                ",
  "   HC.         C                ",
  "    C.         C                ",
  "    C.         C                ",
  "    C.         C                ",
  "     C.        C                ",
  "     C.        C                ",
  "      C.       C                ",
  "      C..      C                ",
  "       C..     C                ",
  "        C..    C                ",
  "         C...  C                ",
  "          CC...C                ",
  "             CCC                ",
  "                                ",
  "                                "
].map(row => row.split(''));

export default defineBlueprint({
  name: 'Weapon (Ranged)',
  slug: 'weapon-ranged',
  category: 'Item',
  grid,
  zones: ["core","details","hilt"],
  mapping: {
    "C": "core",
    ".": "details",
    "H": "hilt"
  },
  anchors: {
    "core": [16, 16],
    "details": [16, 12],
    "hilt": [16, 24]
  }
});
