import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Tool',
  slug: 'tool',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/tool.png',
  zones: ["head","shaft","grip"],
  mapping: {
    "#FFCCCC": "head",
    "#f5a442": "shaft",
    "#f54242": "grip"
},
  anchors: {
    "head": [
        16,
        10
    ],
    "shaft": [
        16,
        20
    ],
    "grip": [
        16,
        20
    ]
}
});
