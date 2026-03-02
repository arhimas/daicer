import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Plant (Gargantuan)',
  slug: 'plant-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/plant-gargantuan.png',
  zones: ["stalk","petals","vines"],
  mapping: {
    "#f54242": "petals",
    "#f5a442": "stalk",
    "#f5f542": "vines"
},
  anchors: {
    "stalk": [
        64,
        72
    ],
    "petals": [
        64,
        20
    ],
    "vines": [
        64,
        56
    ]
}
});
