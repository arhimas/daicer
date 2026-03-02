import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Monstrosity (Huge)',
  slug: 'monstrosity-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/monstrosity-huge.png',
  zones: ["core","eyes","limbs"],
  mapping: {
    "#f54242": "eyes",
    "#f5a442": "limbs"
},
  anchors: {
    "core": [
        48,
        48
    ],
    "eyes": [
        48,
        18
    ],
    "limbs": [
        48,
        36
    ]
}
});
