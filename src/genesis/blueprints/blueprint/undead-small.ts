import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Undead (Small)',
  slug: 'undead-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/undead-small.png',
  zones: ["skull","ribcage","limbs","core"],
  mapping: {
    "#f54242": "skull",
    "#f5a442": "limbs",
    "#CCFFCC": "core"
},
  anchors: {
    "skull": [
        16,
        6
    ],
    "ribcage": [
        16,
        14
    ],
    "limbs": [
        16,
        25
    ],
    "core": [
        16,
        20
    ]
}
});
