import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Fey (Large)',
  slug: 'fey-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/fey-large.png',
  zones: ["head","core","wings"],
  mapping: {
    "#FFCCCC": "head",
    "#EEEEEE": "wings",
    "#CCFFCC": "core"
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
    "wings": [
        32,
        14
    ]
}
});
