import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Dragon (Gargantuan)',
  slug: 'dragon-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/dragon-gargantuan.png',
  zones: ["head","core","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        52,
        8
    ],
    "core": [
        64,
        56
    ],
    "wings": [
        32,
        40
    ],
    "tail": [
        76,
        96
    ]
}
});
