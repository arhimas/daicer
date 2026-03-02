import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Dragon (Large)',
  slug: 'dragon-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/dragon-large.png',
  zones: ["head","core","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        26,
        4
    ],
    "core": [
        32,
        28
    ],
    "wings": [
        16,
        20
    ],
    "tail": [
        38,
        48
    ]
}
});
