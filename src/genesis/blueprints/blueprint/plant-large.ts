import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Plant (Large)',
  slug: 'plant-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/plant-large.png',
  zones: ["stalk","petals","vines"],
  mapping: {
    "#f54242": "petals",
    "#f5a442": "stalk",
    "#f5f542": "vines"
},
  anchors: {
    "stalk": [
        32,
        36
    ],
    "petals": [
        32,
        10
    ],
    "vines": [
        32,
        28
    ]
}
});
