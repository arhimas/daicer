import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Weapon',
  slug: 'weapon',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/weapon.png',
  zones: ["blade","hilt","pommel","shaft","weapon-head"],
  mapping: {
    "#f54242": "hilt",
    "#f5a442": "pommel"
},
  anchors: {
    "hilt": [
        13,
        16
    ]
}
});
