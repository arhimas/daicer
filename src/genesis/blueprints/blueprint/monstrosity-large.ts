import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Monstrosity (Large)',
  slug: 'monstrosity-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/monstrosity-large.png',
  zones: ["core","eyes","limbs"],
  mapping: {
    "#f54242": "eyes",
    "#f5a442": "limbs"
},
  anchors: {
    "core": [
        32,
        32
    ],
    "eyes": [
        32,
        12
    ],
    "limbs": [
        32,
        24
    ]
}
});
