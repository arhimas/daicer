import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Potion',
  slug: 'potion',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/potion.png',
  zones: ["flask","liquid","cork","label"],
  mapping: {
    "#f54242": "cork",
    "#f5a442": "flask",
    "#f5f542": "liquid"
},
  anchors: {
    "flask": [
        14,
        15
    ]
}
});
