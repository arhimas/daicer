import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Humanoid (Gargantuan)',
  slug: 'humanoid-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/humanoid-gargantuan.png',
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
        64,
        20
    ],
    "core": [
        64,
        56
    ],
    "hand-l": [
        12,
        60
    ],
    "hand-r": [
        116,
        60
    ],
    "legs": [
        64,
        104
    ]
}
});
