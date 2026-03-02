import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Floor',
  slug: 'floor',
  category: 'Terrain',
  gridUrl: '/src/genesis/sprites/blueprints/floor.png',
  zones: ["surface","foundation","details"],
  mapping: {
    "#f54242": "surface",
    "#f5a442": "details",
    "#f5f542": "foundation"
},
  anchors: {
    "surface": [
        16,
        16
    ]
}
});
