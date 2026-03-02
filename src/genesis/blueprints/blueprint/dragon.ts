import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Dragon',
  slug: 'dragon',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/dragon.png',
  zones: ["head","core","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        13,
        2
    ],
    "core": [
        16,
        14
    ],
    "wings": [
        8,
        10
    ],
    "tail": [
        19,
        24
    ]
}
});
