import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Construct (Tiny)',
  slug: 'construct-tiny',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/construct-tiny.png',
  zones: ["head","core","arms","legs","power-core"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#f54242": "arms",
    "#f5a442": "power-core",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        16,
        5
    ],
    "core": [
        16,
        14
    ],
    "arms": [
        16,
        14
    ],
    "legs": [
        16,
        25
    ],
    "power-core": [
        16,
        14
    ]
}
});
