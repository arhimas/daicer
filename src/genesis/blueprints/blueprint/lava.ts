import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Lava',
  slug: 'lava',
  category: 'Terrain',
  gridUrl: '/src/genesis/sprites/blueprints/lava.png',
  zones: ["surface","details","foundation"],
  mapping: {
    "#f5f542": "foundation",
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
    "foundation": [
        16,
        28
    ]
}
});
