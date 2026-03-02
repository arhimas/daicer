import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Serpent (Gargantuan)',
  slug: 'serpent-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/serpent-gargantuan.png',
  zones: ["head","body","tail"],
  mapping: {
    "#FFCCCC": "head",
    "#f54242": "body",
    "#FFFFCC": "tail"
},
  anchors: {
    "head": [
        64,
        20
    ],
    "body": [
        64,
        64
    ],
    "tail": [
        64,
        108
    ]
}
});
