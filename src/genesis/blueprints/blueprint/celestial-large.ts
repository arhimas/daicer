import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Celestial (Large)',
  slug: 'celestial-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/celestial-large.png',
  zones: ["head","core","wings","halo"],
  mapping: {
    "#f54242": "halo",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
},
  anchors: {
    "head": [
        32,
        12
    ],
    "core": [
        32,
        28
    ],
    "wings": [
        32,
        24
    ],
    "halo": [
        32,
        6
    ]
}
});
