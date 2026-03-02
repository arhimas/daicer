import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Undead (Huge)',
  slug: 'undead-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/undead-huge.png',
  zones: ["skull","ribcage","limbs","core"],
  mapping: {
    "#f54242": "skull",
    "#f5a442": "limbs",
    "#CCFFCC": "core"
},
  anchors: {
    "skull": [
        48,
        18
    ],
    "ribcage": [
        48,
        42
    ],
    "limbs": [
        48,
        75
    ],
    "core": [
        48,
        60
    ]
}
});
