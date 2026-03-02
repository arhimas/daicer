import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Weapon (Polearm)',
  slug: 'weapon-polearm',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/weapon-polearm.png',
  zones: ["shaft","weapon-head","decor"],
  mapping: {
    "#f54242": "decor",
    "#f5a442": "shaft"
},
  anchors: {
    "shaft": [
        16,
        16
    ],
    "weapon-head": [
        16,
        4
    ],
    "decor": [
        16,
        24
    ]
}
});
