import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Water',
  slug: 'water',
  category: 'Terrain',
  gridUrl: '/src/genesis/sprites/blueprints/water.png',
  zones: ["surface","details","decor"],
  mapping: {
    "#f54242": "surface",
    "#f5a442": "details"
},
  anchors: {
    "surface": [
        16,
        16
    ],
    "details": [
        16,
        20
    ],
    "decor": [
        16,
        24
    ]
}
});
