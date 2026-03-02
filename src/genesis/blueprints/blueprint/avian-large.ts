import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Avian (Large)',
  slug: 'avian-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/avian-large.png',
  zones: ["head","core","legs","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#EEEEEE": "wings",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        32,
        8
    ],
    "core": [
        32,
        18
    ],
    "legs": [
        32,
        28
    ],
    "wings": [
        32,
        20
    ],
    "tail": [
        32,
        40
    ]
}
});
