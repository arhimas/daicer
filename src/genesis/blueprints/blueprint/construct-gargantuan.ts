import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Construct (Gargantuan)',
  slug: 'construct-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/construct-gargantuan.png',
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
        64,
        20
    ],
    "core": [
        64,
        56
    ],
    "arms": [
        64,
        56
    ],
    "legs": [
        64,
        100
    ],
    "power-core": [
        64,
        56
    ]
}
});
