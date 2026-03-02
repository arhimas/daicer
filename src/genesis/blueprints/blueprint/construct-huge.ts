import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Construct (Huge)',
  slug: 'construct-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/construct-huge.png',
  zones: ["head","core","arms","legs","power-core"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#f54242": "arms",
    "#f5a442": "power-core",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        48,
        15
    ],
    "core": [
        48,
        42
    ],
    "arms": [
        48,
        42
    ],
    "legs": [
        48,
        75
    ],
    "power-core": [
        48,
        42
    ]
}
});
