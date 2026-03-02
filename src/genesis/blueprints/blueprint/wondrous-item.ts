import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Wondrous Item',
  slug: 'wondrous-item',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/wondrous-item.png',
  zones: ["chain","metal","gem"],
  mapping: {
    "#f54242": "chain",
    "#f5a442": "metal"
},
  anchors: {
    "chain": [
        16,
        8
    ],
    "metal": [
        16,
        16
    ],
    "gem": [
        16,
        16
    ]
}
});
