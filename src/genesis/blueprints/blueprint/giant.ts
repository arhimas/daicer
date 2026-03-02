import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Giant',
  slug: 'giant',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/giant.png',
  zones: ["head","core","arms","legs"],
  mapping: {
    "#FFCCCC": "head",
    "#f54242": "arms",
    "#CCFFCC": "core",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        16,
        4
    ],
    "core": [
        16,
        13
    ],
    "arms": [
        16,
        13
    ],
    "legs": [
        16,
        25
    ]
}
});
