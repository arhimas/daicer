import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Plant (Tiny)',
  slug: 'plant-tiny',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/plant-tiny.png',
  zones: ["stalk","petals","vines"],
  mapping: {
    "#f54242": "petals",
    "#f5a442": "stalk",
    "#f5f542": "vines"
},
  anchors: {
    "stalk": [
        16,
        18
    ],
    "petals": [
        16,
        5
    ],
    "vines": [
        16,
        14
    ]
}
});
