import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Plant (Huge)',
  slug: 'plant-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/plant-huge.png',
  zones: ["stalk","petals","vines"],
  mapping: {
    "#f54242": "petals",
    "#f5a442": "stalk",
    "#f5f542": "vines"
},
  anchors: {
    "stalk": [
        48,
        54
    ],
    "petals": [
        48,
        15
    ],
    "vines": [
        48,
        42
    ]
}
});
