import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fey (Huge)',
  slug: 'fey-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fey-huge.png',
  zones: ["head","core","wings"],
  mapping: {
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
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
    "wings": [
        48,
        21
    ]
}
});
