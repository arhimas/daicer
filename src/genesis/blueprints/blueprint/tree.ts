import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Tree',
  slug: 'tree',
  category: 'Terrain',
  gridUrl: '/src/genesis/sprites/blueprints/tree.png',
  zones: ["structure","details","roots"],
  mapping: {
    "#f5a442": "roots",
    "#f54242": "structure"
},
  anchors: {
    "structure": [
        16,
        24
    ],
    "details": [
        16,
        8
    ],
    "roots": [
        16,
        28
    ]
}
});
