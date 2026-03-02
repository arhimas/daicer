import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Celestial (Small)',
  slug: 'celestial-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/celestial-small.png',
  zones: ["head","core","wings","halo"],
  mapping: {
    "#f54242": "halo",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
},
  anchors: {
    "head": [
        16,
        6
    ],
    "core": [
        16,
        14
    ],
    "wings": [
        16,
        12
    ],
    "halo": [
        16,
        3
    ]
}
});
