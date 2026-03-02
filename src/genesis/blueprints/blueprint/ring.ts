import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Ring',
  slug: 'ring',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/ring.png',
  zones: ["core","gem"],
  mapping: {
    "#f5a442": "gem",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        16,
        16
    ],
    "gem": [
        16,
        12
    ]
}
});
