import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Celestial (Huge)',
  slug: 'celestial-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/celestial-huge.png',
  zones: ["head","core","wings","halo"],
  mapping: {
    "#f54242": "halo",
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
},
  anchors: {
    "head": [
        48,
        18
    ],
    "core": [
        48,
        42
    ],
    "wings": [
        48,
        36
    ],
    "halo": [
        48,
        9
    ]
}
});
