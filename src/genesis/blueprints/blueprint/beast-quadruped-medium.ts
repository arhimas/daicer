import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Beast Quadruped (Medium)',
  slug: 'beast-quadruped-medium',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/beast-quadruped-medium.png',
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
        14,
        10
    ],
    "core": [
        16,
        16
    ],
    "legs": [
        17,
        22
    ],
    "tail": [
        28,
        16
    ],
    "accessory": [
        23,
        13
    ]
}
});
