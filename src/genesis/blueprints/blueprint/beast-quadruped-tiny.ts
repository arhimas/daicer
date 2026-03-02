import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Beast Quadruped (Tiny)',
  slug: 'beast-quadruped-tiny',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/beast-quadruped-tiny.png',
  zones: ["head","core","legs","tail","accessory"],
  mapping: {
    "#FFCCCC": "head",
    "#DDDDDD": "accessory",
    "#CCFFCC": "core",
    "#FFFFCC": "tail",
    "#CCCCFF": "legs"
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
