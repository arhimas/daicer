import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Humanoid (Small)',
  slug: 'humanoid-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/humanoid-small.png',
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
        8
    ],
    "core": [
        15,
        14
    ],
    "legs": [
        15,
        22
    ],
    "hand-l": [
        9,
        14
    ],
    "hand-r": [
        22,
        14
    ]
}
});
