import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Dragon (Huge)',
  slug: 'dragon-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/dragon-huge.png',
  zones: ["head","core","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        39,
        6
    ],
    "core": [
        48,
        42
    ],
    "wings": [
        24,
        30
    ],
    "tail": [
        57,
        72
    ]
}
});
