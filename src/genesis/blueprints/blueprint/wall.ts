import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Wall',
  slug: 'wall',
  category: 'Terrain',
  gridUrl: '/src/genesis/sprites/blueprints/wall.png',
  zones: ["structure","trim","decor"],
  mapping: {
    "#f54242": "trim"
},
  anchors: {
    "structure": [
        16,
        16
    ]
}
});
