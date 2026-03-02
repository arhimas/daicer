import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Avian (Gargantuan)',
  slug: 'avian-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/avian-gargantuan.png',
  zones: ["head","core","legs","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#EEEEEE": "wings",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        64,
        15
    ],
    "core": [
        64,
        30
    ],
    "legs": [
        64,
        46
    ],
    "wings": [
        64,
        30
    ],
    "tail": [
        64,
        60
    ]
}
});
