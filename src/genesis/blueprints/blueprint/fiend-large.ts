import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fiend (Large)',
  slug: 'fiend-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fiend-large.png',
  zones: ["head","core","horns","wings"],
  mapping: {
    "#f54242": "horns",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
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
    "horns": [
        28,
        6
    ],
    "wings": [
        20,
        16
    ]
}
});
