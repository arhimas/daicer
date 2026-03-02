import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fiend',
  slug: 'fiend',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fiend.png',
  zones: ["head","core","horns","wings"],
  mapping: {
    "#f54242": "horns",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
},
  anchors: {
    "head": [
        16,
        5
    ],
    "core": [
        16,
        14
    ],
    "horns": [
        14,
        3
    ],
    "wings": [
        10,
        8
    ]
}
});
