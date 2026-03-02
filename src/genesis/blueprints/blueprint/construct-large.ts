import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Construct (Large)',
  slug: 'construct-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/construct-large.png',
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
        32,
        10
    ],
    "core": [
        32,
        28
    ],
    "arms": [
        32,
        28
    ],
    "legs": [
        32,
        50
    ],
    "power-core": [
        32,
        28
    ]
}
});
