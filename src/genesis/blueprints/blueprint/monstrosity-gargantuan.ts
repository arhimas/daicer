import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Monstrosity (Gargantuan)',
  slug: 'monstrosity-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/monstrosity-gargantuan.png',
  zones: ["core","eyes","limbs"],
  mapping: {
    "#f54242": "eyes",
    "#f5a442": "limbs"
},
  anchors: {
    "core": [
        64,
        64
    ],
    "eyes": [
        64,
        24
    ],
    "limbs": [
        64,
        48
    ]
}
});
