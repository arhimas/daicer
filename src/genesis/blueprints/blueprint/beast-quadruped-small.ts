import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Beast Quadruped (Small)',
  slug: 'beast-quadruped-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/beast-quadruped-small.png',
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
