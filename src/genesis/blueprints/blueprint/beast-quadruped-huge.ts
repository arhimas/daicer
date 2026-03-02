import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Beast Quadruped (Huge)',
  slug: 'beast-quadruped-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/beast-quadruped-huge.png',
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
        15,
        24
    ],
    "core": [
        51,
        36
    ],
    "legs": [
        36,
        69
    ],
    "tail": [
        78,
        36
    ],
    "accessory": [
        54,
        15
    ]
}
});
