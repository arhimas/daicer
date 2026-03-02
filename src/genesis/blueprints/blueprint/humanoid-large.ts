import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Humanoid (Large)',
  slug: 'humanoid-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/humanoid-large.png',
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
        32,
        10
    ],
    "core": [
        32,
        28
    ],
    "legs": [
        32,
        50
    ],
    "hand-l": [
        14,
        30
    ],
    "hand-r": [
        48,
        30
    ]
}
});
