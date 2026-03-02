import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Serpent (Huge)',
  slug: 'serpent-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/serpent-huge.png',
  zones: ["head","body","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#f54242": "body",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        48,
        15
    ],
    "body": [
        48,
        48
    ],
    "tail": [
        48,
        81
    ]
}
});
