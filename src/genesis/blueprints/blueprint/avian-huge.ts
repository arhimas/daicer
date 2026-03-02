import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Avian (Huge)',
  slug: 'avian-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/avian-huge.png',
  zones: ["head","core","legs","wings","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#EEEEEE": "wings",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        48,
        12
    ],
    "core": [
        48,
        25
    ],
    "legs": [
        48,
        38
    ],
    "wings": [
        48,
        25
    ],
    "tail": [
        48,
        51
    ]
}
});
