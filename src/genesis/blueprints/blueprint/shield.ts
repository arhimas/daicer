import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Shield',
  slug: 'shield',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/shield.png',
  zones: ["primary-material","trim","core"],
  mapping: {
    "#f54242": "trim",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        16,
        16
    ]
}
});
