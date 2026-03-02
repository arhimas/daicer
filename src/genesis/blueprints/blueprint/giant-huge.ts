import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Giant (Huge)',
  slug: 'giant-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/giant-huge.png',
  zones: ["head","core","arms","legs"],
  mapping: {
    "#FFCCCC": "head",
    "#f54242": "arms",
    "#CCFFCC": "core",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        48,
        12
    ],
    "core": [
        48,
        39
    ],
    "arms": [
        48,
        39
    ],
    "legs": [
        48,
        75
    ]
}
});
