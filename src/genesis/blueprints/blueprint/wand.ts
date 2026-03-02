import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Wand',
  slug: 'wand',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/wand.png',
  zones: ["shaft","core"],
  mapping: {
    "#CCFFCC": "core",
    "#f5a442": "shaft"
},
  anchors: {
    "shaft": [
        16,
        16
    ],
    "core": [
        16,
        4
    ]
}
});
