import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Apparel',
  slug: 'apparel',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/apparel.png',
  zones: ["primary-material","trim","clasps","padding"],
  mapping: {
    "#f54242": "primary-material",
    "#f5a442": "clasps"
},
  anchors: {
    "primary-material": [
        16,
        16
    ]
}
});
