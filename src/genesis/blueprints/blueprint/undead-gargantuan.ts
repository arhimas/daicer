import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Undead (Gargantuan)',
  slug: 'undead-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/undead-gargantuan.png',
  zones: ["skull","ribcage","limbs","core"],
  mapping: {
    "#f54242": "skull",
    "#f5a442": "limbs",
    "#CCFFCC": "core"
},
  anchors: {
    "skull": [
        64,
        24
    ],
    "ribcage": [
        64,
        56
    ],
    "limbs": [
        64,
        100
    ],
    "core": [
        64,
        80
    ]
}
});
