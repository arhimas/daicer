import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Feature',
  slug: 'feature',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/feature.png',
  zones: ["aura"],
  mapping: {
    "#f54242": "aura"
},
  anchors: {
    "aura": [
        16,
        16
    ]
}
});
