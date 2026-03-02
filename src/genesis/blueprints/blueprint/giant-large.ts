import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Giant (Large)',
  slug: 'giant-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/giant-large.png',
  zones: ["head","core","arms","legs"],
  mapping: {
    "#FFCCCC": "head",
    "#f54242": "arms",
    "#CCFFCC": "core",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        32,
        8
    ],
    "core": [
        32,
        26
    ],
    "arms": [
        32,
        26
    ],
    "legs": [
        32,
        50
    ]
}
});
