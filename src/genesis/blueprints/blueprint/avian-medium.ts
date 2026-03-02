import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Avian (Medium)',
  slug: 'avian-medium',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/avian-medium.png',
  zones: ["head","core","legs","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#EEEEEE": "wings",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        16,
        5
    ],
    "core": [
        16,
        11
    ],
    "legs": [
        16,
        14
    ],
    "wings": [
        16,
        12
    ],
    "tail": [
        16,
        22
    ]
}
});
