import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Ammunition',
  slug: 'ammunition',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/ammunition.png',
  zones: ["weapon-head","shaft","fletching","casing","projectile"],
  mapping: {
    "#f54242": "weapon-head",
    "#f5a442": "shaft",
    "#f5f542": "fletching"
},
  anchors: {
    "weapon-head": [
        13,
        13
    ]
}
});
