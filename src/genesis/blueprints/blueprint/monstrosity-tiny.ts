import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Monstrosity (Tiny)',
  slug: 'monstrosity-tiny',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/monstrosity-tiny.png',
  zones: ["core","eyes","limbs"],
  mapping: {
    "#f54242": "eyes",
    "#f5a442": "limbs"
},
  anchors: {
    "core": [
        16,
        16
    ],
    "eyes": [
        16,
        6
    ],
    "limbs": [
        16,
        12
    ]
}
});
