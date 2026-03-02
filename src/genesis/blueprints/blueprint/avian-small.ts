import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Avian (Small)',
  slug: 'avian-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/avian-small.png',
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
        4
    ],
    "core": [
        16,
        12
    ],
    "legs": [
        16,
        16
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
