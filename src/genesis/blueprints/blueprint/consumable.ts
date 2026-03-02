import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Consumable',
  slug: 'consumable',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/consumable.png',
  zones: ["stopper","glass","liquid"],
  mapping: {
    "#f54242": "stopper",
    "#f5a442": "glass",
    "#f5f542": "liquid"
},
  anchors: {
    "stopper": [
        16,
        10
    ],
    "glass": [
        16,
        17
    ],
    "liquid": [
        16,
        17
    ]
}
});
