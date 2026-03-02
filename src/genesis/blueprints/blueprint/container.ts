import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Container',
  slug: 'container',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/container.png',
  zones: ["trim","wood","lock"],
  mapping: {
    "#f54242": "trim",
    "#f5a442": "wood",
    "#f5f542": "lock"
},
  anchors: {
    "trim": [
        16,
        15
    ],
    "wood": [
        16,
        15
    ],
    "lock": [
        16,
        15
    ]
}
});
