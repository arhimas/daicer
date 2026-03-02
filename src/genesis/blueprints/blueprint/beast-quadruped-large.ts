import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Beast Quadruped (Large)',
  slug: 'beast-quadruped-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/beast-quadruped-large.png',
  zones: ["head","core","legs","tail","accessory"],
  mapping: {
    "#DDDDDD": "accessory",
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#FFFFCC": "tail",
    "#CCCCFF": "legs"
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
