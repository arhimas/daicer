import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fey (Gargantuan)',
  slug: 'fey-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fey-gargantuan.png',
  zones: ["head","core","wings"],
  mapping: {
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
    "wings": [
        64,
        28
    ]
}
});
