import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Celestial (Gargantuan)',
  slug: 'celestial-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/celestial-gargantuan.png',
  zones: ["head","core","wings","halo"],
  mapping: {
    "#f54242": "halo",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
},
  anchors: {
    "head": [
        64,
        24
    ],
    "core": [
        64,
        56
    ],
    "wings": [
        64,
        48
    ],
    "halo": [
        64,
        12
    ]
}
});
