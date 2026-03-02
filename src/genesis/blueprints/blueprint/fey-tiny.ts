import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fey (Tiny)',
  slug: 'fey-tiny',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fey-tiny.png',
  zones: ["head","core","wings"],
  mapping: {
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
    "wings": [
        16,
        7
    ]
}
});
