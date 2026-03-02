import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Loot',
  slug: 'loot',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/loot.png',
  zones: ["gem","gem-shine","coin","coin-edge"],
  mapping: {
    "#f54242": "gem-edge",
    "#f5a442": "gem",
    "#f5f542": "coin-edge",
    "#42f554": "coin"
},
  anchors: {
    "gem": [
        16,
        13
    ],
    "coin": [
        16,
        21
    ]
}
});
