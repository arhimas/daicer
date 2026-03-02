import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Humanoid (Medium)',
  slug: 'humanoid-medium',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/humanoid-medium.png',
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
        4
    ],
    "core": [
        15,
        12
    ],
    "legs": [
        15,
        24
    ],
    "hand-l": [
        8,
        13
    ],
    "hand-r": [
        23,
        13
    ]
}
});
