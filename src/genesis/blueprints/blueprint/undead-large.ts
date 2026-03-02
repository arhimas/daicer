import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Undead (Large)',
  slug: 'undead-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/undead-large.png',
  zones: ["skull","ribcage","limbs","core"],
  mapping: {
    "#f54242": "skull",
    "#f5a442": "limbs",
    "#CCFFCC": "core"
},
  anchors: {
    "skull": [
        32,
        12
    ],
    "ribcage": [
        32,
        28
    ],
    "limbs": [
        32,
        50
    ],
    "core": [
        32,
        40
    ]
}
});
