import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Rod',
  slug: 'rod',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/rod.png',
  zones: ["shaft","base","tip"],
  mapping: {
    "#f54242": "tip",
    "#f5a442": "base"
},
  anchors: {
    "tip": [
        16,
        7
    ],
    "base": [
        16,
        24
    ],
    "shaft": [
        16,
        16
    ]
}
});
