import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Humanoid (Tiny)',
  slug: 'humanoid-tiny',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/humanoid-tiny.png',
  zones: ["head","core","legs","hand-l","hand-r"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#FFCCFF": "hand-l",
    "#CCFFFF": "hand-r",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        15,
        10
    ],
    "core": [
        15,
        13
    ],
    "hand-l": [
        13,
        13
    ],
    "hand-r": [
        18,
        13
    ],
    "legs": [
        15,
        16
    ]
}
});
