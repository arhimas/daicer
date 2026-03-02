import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fiend (Huge)',
  slug: 'fiend-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fiend-huge.png',
  zones: ["head","core","horns","wings"],
  mapping: {
    "#f54242": "horns",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
},
  anchors: {
    "head": [
        48,
        15
    ],
    "core": [
        48,
        42
    ],
    "horns": [
        42,
        9
    ],
    "wings": [
        30,
        24
    ]
}
});
