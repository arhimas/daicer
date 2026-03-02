import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Giant (Gargantuan)',
  slug: 'giant-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/giant-gargantuan.png',
  zones: ["head","core","arms","legs"],
  mapping: {
    "#FFCCCC": "head",
    "#f54242": "arms",
    "#CCFFCC": "core",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        64,
        16
    ],
    "core": [
        64,
        52
    ],
    "arms": [
        64,
        52
    ],
    "legs": [
        64,
        100
    ]
}
});
