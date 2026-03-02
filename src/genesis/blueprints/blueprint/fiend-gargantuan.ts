import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fiend (Gargantuan)',
  slug: 'fiend-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fiend-gargantuan.png',
  zones: ["head","core","horns","wings"],
  mapping: {
    "#f54242": "horns",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
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
    "horns": [
        56,
        12
    ],
    "wings": [
        40,
        32
    ]
}
});
