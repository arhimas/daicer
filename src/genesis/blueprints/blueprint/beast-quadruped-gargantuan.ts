import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Beast Quadruped (Gargantuan)',
  slug: 'beast-quadruped-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/beast-quadruped-gargantuan.png',
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
        16,
        36
    ],
    "core": [
        60,
        56
    ],
    "legs": [
        60,
        104
    ],
    "tail": [
        104,
        68
    ],
    "accessory": [
        60,
        20
    ]
}
});
